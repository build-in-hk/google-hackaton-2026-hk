import "./globals.css";
import "@copilotkit/react-ui/styles.css";
import { CopilotKit } from "@copilotkit/react-core";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <CopilotKit
          runtimeUrl="/api/copilotkit"
          agent="default"
          useSingleEndpoint={false}
        >
          {children}
        </CopilotKit>
      </body>
    </html>
  );
}
