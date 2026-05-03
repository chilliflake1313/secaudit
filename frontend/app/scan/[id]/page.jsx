export default function ScanPage({ params }) {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div>
        <h1>Scan</h1>
        <p>{params.id}</p>
      </div>
    </main>
  );
}
