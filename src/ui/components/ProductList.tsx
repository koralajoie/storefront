import { cookies } from "next/headers";
import { ProductElement } from "./ProductElement";
import { type ProductListItemFragment } from "@/gql/graphql";

export const ProductList = async ({ products }: { products: readonly ProductListItemFragment[] }) => {
	const checkoutId = cookies().get("checkoutId")?.value || "";

	return (
		<ul
			role="list"
			data-testid="ProductList"
			className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
		>
			{products.map((product, index) => (
				<ProductElement
					key={product.id}
					product={product}
					priority={index === 0}
					loading={index < 3 ? "eager" : "lazy"}
					checkoutId={checkoutId}
				/>
			))}
		</ul>
	);
};
