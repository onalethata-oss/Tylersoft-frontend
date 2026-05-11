'use client';

interface PdfViewerProps {
  blobUrl: string;
  title?: string;
}

export const PdfViewer = ({ blobUrl, title }: PdfViewerProps) => {
  return (
    <iframe
      src={blobUrl}
      title={title ?? 'API Documentation'}
      className="w-full h-full border-0"
      style={{ minHeight: '100%' }}
    />
  );
};
