import React, { useState, useEffect } from "react";
import { clsx } from "clsx";
import { executeGraphQL } from "@/lib/graphql";
import {
	CheckoutAddLineDocument,
	ProductDetailsDocument,
	type ProductDetailsQuery,
	type ProductDetailsQueryVariables,
} from "@/gql/graphql";

export type QuickAddModalProps = {
	visible: boolean;
	onClose: () => void;
	checkoutId: string;
	slug: string;
};

type Variant = {
	id: string;
	name: string;
	quantityAvailable: number;
};

type ProductType = {
	name: string;
	variants: Variant[];
};

export function QuickAddModal({ visible, onClose, checkoutId, slug }: QuickAddModalProps) {
	const [product, setProduct] = useState<ProductType | null>(null);
	const [selectedVariantID, setSelectedVariantID] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		async function fetchProduct() {
			try {
				setLoading(true);
				setError(null);

				const response = await executeGraphQL<ProductDetailsQuery, ProductDetailsQueryVariables>(
					ProductDetailsDocument,
					{
						variables: {
							slug: slug,
						},
						revalidate: 60,
					},
				);

				if (response && response.product) {
					const productData = response.product;
					const formattedProduct: ProductType = {
						name: productData.name,
						variants:
							productData.variants?.map((variant) => ({
								id: variant.id,
								name: variant.name,
								quantityAvailable: variant.quantityAvailable ?? 0,
							})) || [],
					};
					setProduct(formattedProduct);
				}
			} catch (error) {
				setError(error as Error);
			} finally {
				setLoading(false);
			}
		}

		if (visible && slug) {
			void fetchProduct();
		}
	}, [visible, slug]);

	if (!visible) return null;
	if (loading) return <div>Loading...</div>;
	if (error) return <div>Error: {error.message}</div>;

	const handleVariantChange = (variantId: string) => {
		setSelectedVariantID(variantId);
	};

	const handleAddToCart = async () => {
		if (!selectedVariantID) {
			return;
		}

		try {
			await executeGraphQL(CheckoutAddLineDocument, {
				variables: {
					id: checkoutId,
					productVariantId: selectedVariantID,
				},
				cache: "no-cache",
			});

			// cheating to update cart count
			window.location.reload();
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div
			className="fixed inset-0 z-10 overflow-y-auto"
			aria-labelledby="modal-title"
			role="dialog"
			aria-modal="true"
		>
			<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
			<div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
				<div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
					<div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
						<div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
							<h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">
								Add to cart
							</h3>
							{product && (
								<div className="mt-2">
									<h2>{product.name}</h2>
									{product.variants.length > 0 && (
										<fieldset className="my-4" role="radiogroup" data-testid="VariantSelector">
											<legend className="sr-only">Variants</legend>
											<div className="flex flex-wrap gap-3">
												{product.variants.map((variant) => {
													const isDisabled = !variant.quantityAvailable;

													return (
														<label
															key={variant.id}
															className={clsx(
																"relative flex min-w-[8ch] items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap rounded border p-3 text-center text-sm font-semibold focus-within:outline focus-within:outline-2 aria-disabled:cursor-not-allowed aria-disabled:bg-neutral-100 aria-disabled:opacity-50",
																isDisabled && "pointer-events-none",
															)}
														>
															<input
																value={variant.id}
																className="sr-only"
																type="radio"
																tabIndex={isDisabled ? -1 : undefined}
																aria-disabled={isDisabled}
																onChange={() => handleVariantChange(variant.id)}
															/>
															{variant.name}
														</label>
													);
												})}
											</div>
										</fieldset>
									)}
								</div>
							)}
						</div>
					</div>
					<div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
						<button
							onClick={handleAddToCart}
							type="button"
							className="ml-2 inline-flex w-full items-center justify-center rounded-md bg-neutral-900 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-neutral-800 sm:w-auto"
						>
							Add to cart
						</button>
						<button
							type="button"
							onClick={onClose}
							className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-white px-6 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
						>
							Cancel
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
