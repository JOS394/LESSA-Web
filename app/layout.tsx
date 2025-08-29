import './globals.css'

export const metadata = {
  title: "LESSA Web",
  description: "Diccionario y ejercicios de la Lengua de Señas Salvadoreña (LESSA)",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
