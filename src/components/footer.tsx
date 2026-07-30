import { cn } from "@/lib/utils";

export interface FooterProps {
  brideName?: string;
  groomName?: string;
  year?: number;
  creditName?: string;
  className?: string;
}

export function Footer({
  brideName = "Adrianna",
  groomName = "Jan",
  year = 2027,
  creditName = "Jakuba Grygla",
  className,
}: FooterProps) {
  return (
    <footer
      className={cn(
        "px-4 py-6 text-center text-xs text-muted-foreground/60 sm:px-6",
        className,
      )}
    >
      <p>
        {brideName} & {groomName} © {year}
      </p>
      <p className="mt-1.5 opacity-90">
        Strona stworzona z ❤️ jako prezent ślubny od {creditName}
      </p>
    </footer>
  );
}
