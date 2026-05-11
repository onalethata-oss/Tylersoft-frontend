const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
  'http://localhost:8080/api';

const DEBUG = process.env.NEXT_PUBLIC_DEBUG === 'true';

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
}

interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

class ApiClient {
  // ================= TOKEN =================
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  // ================= HEADERS =================
  private buildHeaders(extra?: Record<string, string>) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...extra,
    };

    const token = this.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    return headers;
  }

  // ================= SAFE PARSE =================
  private async safeParse(response: Response) {
    const contentType = response.headers.get('content-type');

    // No content
    if (response.status === 204) return null;

    try {
      if (contentType?.includes('application/json')) {
        return await response.json();
      }

      const text = await response.text();
      return text || null;
    } catch (err) {
      if (DEBUG) console.error('[API PARSE ERROR]', err);
      return null;
    }
  }

  // ================= CORE REQUEST =================
  async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    const url = `${BASE_URL}${endpoint}`;
    const method = config.method || 'GET';

    if (DEBUG) {
      console.log('[API]', method, url, config.body || '');
    }

    try {
      const response = await fetch(url, {
        method,
        headers: this.buildHeaders(config.headers),
        body:
          method !== 'GET' && config.body !== undefined
            ? JSON.stringify(config.body)
            : undefined,
      });

      const data = await this.safeParse(response);

      // ================= ERROR HANDLING =================
      if (!response.ok) {
        let message = `HTTP ${response.status}`;

        if (typeof data === 'string') {
          if (data.trim().toLowerCase().startsWith('<html') || data.includes('<body')) {
            message = `Internal Server Error (${response.status})`;
          } else {
            message = data;
          }
        } else if (data && typeof data === 'object') {
          message =
            (data as any).message ||
            (data as any).error ||
            message;
        }

        if (DEBUG) {
          console.error('[API ERROR]', {
            status: response.status,
            data,
          });
        }

        // auto logout on 401
        if (response.status === 401 && typeof window !== 'undefined') {
          localStorage.clear();
          window.location.href = '/login';
        }

        return {
          success: false,
          error: message,
        };
      }

      // ================= SPRING BOOT WRAPPER =================
      if (
        data &&
        typeof data === 'object' &&
        'success' in (data as object) &&
        'data' in (data as object)
      ) {
        const wrapped = data as any;
        return {
          success: wrapped.success,
          data: wrapped.data,
        };
      }

      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      if (DEBUG) {
        console.error('[API NETWORK ERROR]', error);
      }

      // Special handling for "Failed to fetch" (Server Down)
      const isNetworkError = error instanceof TypeError && error.message.toLowerCase().includes('fetch');
      const errorMessage = isNetworkError 
        ? 'API Server Unreachable. Please ensure the backend is running at ' + BASE_URL 
        : (error instanceof Error ? error.message : 'Network error');

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // ================= AUTH =================
  async login(email: string, password: string) {
    try {
      const res = await this.request<any>('/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      if (!res.success || !res.data) {
        return { success: false, error: res.error };
      }

      const json = res.data;

      const role =
        typeof json.role === 'string'
          ? json.role
          : json.role?.toString?.() || 'USER';

      return {
        success: true,
        data: {
          id: json.sessionId || json.email,
          email: json.email,
          name:
            json.email?.split('@')[0]?.charAt(0).toUpperCase() +
              json.email?.split('@')[0]?.slice(1) || 'User',
          role,
          token: json.token,
          sessionId: json.sessionId,
        },
      };
    } catch (error) {
      console.error('[API LOGIN ERROR]', error);
      return {
        success: false,
        error: 'Login failed',
      };
    }
  }

  // ================= LOGOUT =================
  async logout() {
    if (typeof window === 'undefined') return;

    const sessionId = localStorage.getItem('sessionId');

    try {
      if (sessionId) {
        await this.request(`/auth/logout?sessionId=${sessionId}`, {
          method: 'POST',
        });
      }
    } catch (e) {
      if (DEBUG) console.error('[API LOGOUT ERROR]', e);
    }

    localStorage.clear();
  }

  // ================= USERS =================
  async getAdminAPIs() {
    return this.request<any[]>('/admin/apis');
  }

  async createApi(data: { name: string; endpointUrl: string; description?: string; documentation?: string }) {
    return this.request('/admin/apis', {
      method: 'POST',
      body: data,
    });
  }

  async getUsers() {
    return this.request<any[]>('/admin/users');
  }

  async createUser(data: any) {
    return this.request('/admin/users', {
      method: 'POST',
      body: data,
    });
  }

  async updateUser(id: string | number, data: any) {
    return this.request(`/admin/users/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteUser(id: string | number) {
    return this.request(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleUser(id: string | number, active: boolean) {
    return this.request(`/admin/users/${id}/active?active=${active}`, {
      method: 'PUT',
    });
  }

  // ================= APIS =================

  async deleteApi(id: string | number) {
    return this.request(`/admin/apis/${id}`, {
      method: 'DELETE',
    });
  }

  async updateApi(id: string | number, data: any) {
    return this.request(`/admin/apis/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async uploadApiDocs(id: string | number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
      const response = await fetch(`${BASE_URL}/admin/apis/${id}/docs`, {
        method: 'POST',
        headers,
        body: formData,
      });
      const data = await this.safeParse(response);
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: 'Upload failed' };
    }
  }

  async getUserAPIs() {
    return this.request<any[]>('/user/apis');
  }

  async getAssignments() {
    return this.request<any[]>('/user-api-assignments');
  }

  async getUserAssignedApis(userId: string | number) {
    return this.request<any[]>(`/admin/users/${userId}/apis`);
  }

  async assignApi(userId: string | number, apiId: string | number) {
    return this.request(`/user-api-assignments/users/${userId}/apis/${apiId}`, {
      method: 'POST',
    });
  }

  async revokeApi(userId: string | number, apiId: string | number) {
    return this.request(`/user-api-assignments/users/${userId}/apis/${apiId}`, {
      method: 'DELETE',
    });
  }

  async toggleAssignment(assignmentId: string | number, active: boolean) {
    return this.request(`/user-api-assignments/${assignmentId}/active?active=${active}`, {
      method: 'PUT',
    });
  }

  // ================= AUDIT =================
  async getAuditLogs(page = 0, size = 20) {
    return this.request<PaginatedResponse<any>>(`/audit?page=${page}&size=${size}`);
  }
}

export const apiClient = new ApiClient();