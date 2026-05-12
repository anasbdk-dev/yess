import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl gold-text">404</h1>
        <h2 className="mt-4 font-display text-2xl text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">This page is no longer on the menu.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-gold-soft">
          Return home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-gold-soft"
        >Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "AURALIS — Luxury Restaurant Operating System" },
      { name: "description", content: "An ultra-premium restaurant ecosystem: smart QR ordering, real-time kitchen, and enterprise admin for fine-dining brands." },
      { name: "theme-color", content: "#1a1714" },
      { property: "og:title", content: "AURALIS — Luxury Restaurant Operating System" },
      { property: "og:description", content: "An ultra-premium restaurant ecosystem: smart QR ordering, real-time kitchen, and enterprise admin for fine-dining brands." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "AURALIS — Luxury Restaurant Operating System" },
      { name: "twitter:description", content: "An ultra-premium restaurant ecosystem: smart QR ordering, real-time kitchen, and enterprise admin for fine-dining brands." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/24427f32-8b3d-4ce0-b5dd-edb4ba688d91/id-preview-ed08122f--b4a39dff-50e0-4b62-b6e8-a88124cec6e2.lovable.app-1778591613309.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/24427f32-8b3d-4ce0-b5dd-edb4ba688d91/id-preview-ed08122f--b4a39dff-50e0-4b62-b6e8-a88124cec6e2.lovable.app-1778591613309.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster
        position="top-center"
        theme="dark"
        toastOptions={{
          style: {
            background: "oklch(0.17 0.006 60 / 0.9)",
            border: "1px solid oklch(0.82 0.13 85 / 0.25)",
            color: "oklch(0.95 0.012 80)",
            backdropFilter: "blur(20px)",
          },
        }}
      />
    </QueryClientProvider>
  );
}
