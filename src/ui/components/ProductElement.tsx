"use client";

import React, { useState, type SyntheticEvent } from "react";
import Link from "next/link";
import { QuickAddModal } from "./QuickAddModal";
import { ProductImageWrapper } from "@/ui/atoms/ProductImageWrapper";
import type { ProductListItemFragment } from "@/gql/graphql";
import { formatMoneyRange } from "@/lib/graphql";
import "./ProductElement.css";

export function ProductElement({
	product,
	loading,
	priority,
	checkoutId,
}: { product: ProductListItemFragment } & {
	loading: "eager" | "lazy";
	priority?: boolean;
	checkoutId: string;
}) {
	const [isModalVisible, setIsModalVisible] = useState(false);

	const showModal = (event: SyntheticEvent): void => {
		event.preventDefault();
		setIsModalVisible(true);
	};

	const handleClose = (): void => {
		setIsModalVisible(false);
	};

	return (
		<li data-testid="ProductElement">
			<Link href={`/products/${product.slug}`} key={product.id} className="product-link">
				<div>
					{product?.thumbnail?.url && (
						<div className="relative">
							<ProductImageWrapper
								loading={loading}
								src={product.thumbnail.url}
								alt={product.thumbnail.alt ?? ""}
								width={512}
								height={512}
								sizes={"512px"}
								priority={priority}
							/>
							<div className="product-link__hover absolute inset-0 mb-4 hidden items-end justify-center">
								<button
									onClick={showModal}
									className="h-12 w-full items-center rounded-md bg-neutral-900 px-6 py-3 text-base font-medium leading-6 text-white shadow hover:bg-neutral-800"
								>
									<span>Quick shop</span>
								</button>
							</div>
						</div>
					)}
					<div className="mt-2 flex justify-between">
						<div>
							<h3 className="mt-1 text-sm font-semibold text-neutral-900">{product.name}</h3>
							<p className="mt-1 text-sm text-neutral-500" data-testid="ProductElement_Category">
								{product.category?.name}
							</p>
						</div>
						<p className="mt-1 text-sm font-medium text-neutral-900" data-testid="ProductElement_PriceRange">
							{formatMoneyRange({
								start: product?.pricing?.priceRange?.start?.gross,
								stop: product?.pricing?.priceRange?.stop?.gross,
							})}
						</p>
					</div>
				</div>
			</Link>
			<QuickAddModal
				visible={isModalVisible}
				onClose={handleClose}
				slug={product.slug}
				checkoutId={checkoutId}
			/>
		</li>
	);
}
