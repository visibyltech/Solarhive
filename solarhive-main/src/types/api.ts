export type ApiCategory = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  parent_id: number | null;
};

export type ApiProduct = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  old_price: number | null;
  rating: string;
  reviews_count: number;
  category: string;
  category_name: string;
};
