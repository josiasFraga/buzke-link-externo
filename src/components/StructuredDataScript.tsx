import Script from 'next/script';

interface StructuredDataScriptProps {
  id: string;
  data: unknown;
}

function serializeStructuredData(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\u003c');
}

export default function StructuredDataScript({ id, data }: StructuredDataScriptProps) {
  return (
    <Script
      id={id}
      type="application/ld+json"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: serializeStructuredData(data) }}
    />
  );
}