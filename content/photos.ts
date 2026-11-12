/**
 * Images on the "What we stock" cards, in the same order as the categories in content/en.json.
 *
 * Each card uses a drawn illustration for now. To use a real photo instead, put the file in
 * public/photos/ and change that one line, with the photo's real size in pixels:
 *   { src: "/photos/notebooks.jpg", width: 1200, height: 800 },
 * Photos are cropped to fill the card; illustrations are shown whole.
 */

export type CardImage = { src: string; width: number; height: number };

const drawn = (slug: string): CardImage => ({ src: `/illustrations/categories/${slug}.svg`, width: 240, height: 160 });

export const categoryImages: CardImage[] = [
  drawn("notebooks"), // Notebooks and registers
  drawn("diaries"), // Diaries and planners
  drawn("billing-rolls"), // Billing rolls
  drawn("files-folders"), // Files and folders
  drawn("photo-paper"), // Photo paper and cartridges
  drawn("it-peripherals"), // Computer and IT peripherals
  drawn("school"), // School stationery
  drawn("office"), // Office stationery
];
