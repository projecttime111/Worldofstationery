import Image from "next/image";
import type { Brand } from "@/content/business";

/**
 * A brand logo at a shared visual height (56px, at most 80% of the tile width).
 * Logo files are pre-trimmed (npm run logos), so equal height means equal visual size.
 * Brands without a logo file show their name as text instead.
 */
export function BrandLogo({ brand, large = false }: { brand: Pick<Brand, "name" | "logo" | "width" | "height">; large?: boolean }) {
  if (brand.logo) {
    return (
      <Image
        src={brand.logo}
        alt={brand.name}
        width={brand.width ?? 200}
        height={brand.height ?? 200}
        unoptimized
        loading="lazy"
        className={`${large ? "h-[84px]" : "h-14"} w-auto max-w-[80%] object-contain`}
      />
    );
  }
  return <span className={`font-heading font-extrabold text-navy ${large ? "text-[34px]" : "text-[24px]"}`}>{brand.name}</span>;
}

/** A clickable logo tile that leads to the brand's card on the catalogues page. */
export function BrandTile({
  brand,
  href,
  label,
  className = "",
  large = false,
}: {
  brand: Brand;
  href: string;
  label: string;
  className?: string;
  large?: boolean;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className={`flex items-center justify-center rounded-tile bg-white no-underline transition-shadow hover:shadow-[0_6px_18px_rgba(27,58,107,0.14)] ${className}`}
    >
      <BrandLogo brand={brand} large={large} />
    </a>
  );
}
