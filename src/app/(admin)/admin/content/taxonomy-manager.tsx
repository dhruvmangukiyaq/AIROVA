"use client";

import * as React from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FolderTree, Layers, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  categorySchema,
  collectionSchema,
  type ActionResult,
} from "../../schemas";
import {
  deleteCategory,
  deleteCollection,
  saveCategory,
  saveCollection,
} from "../../actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { MicroLabel, Panel, PanelHeader } from "@/components/admin/panel";
import {
  CheckField,
  NumberField,
  TextAreaField,
  TextField,
} from "@/components/admin/fields";

interface AdminCollection {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  story: string | null;
  image: string | null;
  sortOrder: number;
  active: boolean;
  _count: { products: number };
}

interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  active: boolean;
  _count: { products: number };
}

type CollectionValues = z.input<typeof collectionSchema>;
type CollectionOutput = z.output<typeof collectionSchema>;
type CategoryValues = z.input<typeof categorySchema>;
type CategoryOutput = z.output<typeof categorySchema>;

const blankCollection = (): CollectionValues => ({
  name: "",
  slug: "",
  tagline: "",
  story: "",
  image: "",
  sortOrder: 0,
  active: true,
});

const blankCategory = (): CategoryValues => ({
  name: "",
  slug: "",
  description: "",
  image: "",
  active: true,
});

export function TaxonomyManager({
  collections,
  categories,
}: {
  collections: AdminCollection[];
  categories: AdminCategory[];
}) {
  /* ----------------------------- collections ---------------------------- */
  const [collectionOpen, setCollectionOpen] = React.useState(false);
  const [editingCollection, setEditingCollection] =
    React.useState<AdminCollection | null>(null);
  const [categoryOpen, setCategoryOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] =
    React.useState<AdminCategory | null>(null);
  const [pending, startTransition] = React.useTransition();

  const collectionForm = useForm<CollectionValues, unknown, CollectionOutput>({
    resolver: zodResolver(collectionSchema) as Resolver<
      CollectionValues,
      unknown,
      CollectionOutput
    >,
    defaultValues: blankCollection(),
    mode: "onBlur",
  });

  const categoryForm = useForm<CategoryValues, unknown, CategoryOutput>({
    resolver: zodResolver(categorySchema) as Resolver<
      CategoryValues,
      unknown,
      CategoryOutput
    >,
    defaultValues: blankCategory(),
    mode: "onBlur",
  });

  const startCollection = (collection?: AdminCollection) => {
    setEditingCollection(collection ?? null);
    collectionForm.reset(
      collection
        ? {
            name: collection.name,
            slug: collection.slug,
            tagline: collection.tagline ?? "",
            story: collection.story ?? "",
            image: collection.image ?? "",
            sortOrder: collection.sortOrder,
            active: collection.active,
          }
        : blankCollection(),
    );
    setCollectionOpen(true);
  };

  const startCategory = (category?: AdminCategory) => {
    setEditingCategory(category ?? null);
    categoryForm.reset(
      category
        ? {
            name: category.name,
            slug: category.slug,
            description: category.description ?? "",
            image: category.image ?? "",
            active: category.active,
          }
        : blankCategory(),
    );
    setCategoryOpen(true);
  };

  const onCollectionSubmit = collectionForm.handleSubmit((values) => {
    startTransition(async () => {
      const result: ActionResult = await saveCollection(
        values,
        editingCollection ? editingCollection.id : undefined,
      );
      if (result.ok) {
        toast.success(result.message ?? "Collection saved");
        setCollectionOpen(false);
      } else toast.error(result.error ?? "Could not save the collection");
    });
  });

  const onCategorySubmit = categoryForm.handleSubmit((values) => {
    startTransition(async () => {
      const result: ActionResult = await saveCategory(
        values,
        editingCategory ? editingCategory.id : undefined,
      );
      if (result.ok) {
        toast.success(result.message ?? "Category saved");
        setCategoryOpen(false);
      } else toast.error(result.error ?? "Could not save the category");
    });
  });

  const removeCollection = async (id: string) => {
    const result = await deleteCollection(id);
    if (result.ok) toast.success(result.message ?? "Collection deleted");
    else toast.error(result.error ?? "Could not delete the collection");
  };

  const removeCategory = async (id: string) => {
    const result = await deleteCategory(id);
    if (result.ok) toast.success(result.message ?? "Category deleted");
    else toast.error(result.error ?? "Could not delete the category");
  };

  const cErrors = collectionForm.formState.errors;
  const catErrors = categoryForm.formState.errors;
  const collectionActive = useWatch({
    control: collectionForm.control,
    name: "active",
  });
  const categoryActive = useWatch({
    control: categoryForm.control,
    name: "active",
  });

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel>
          <PanelHeader
            title="Collections"
            hint="Editorial groupings shown on /collections"
            action={
              <Button
                type="button"
                variant="gold-outline"
                size="xs"
                onClick={() => startCollection()}
              >
                <Plus className="size-3" aria-hidden />
                New collection
              </Button>
            }
          />
          {collections.length === 0 ? (
            <p className="px-5 py-6 text-sm text-cream/45">
              No collections yet — products can still sit in categories.
            </p>
          ) : (
            <ul className="divide-y divide-ink-line">
              {collections.map((collection) => (
                <li
                  key={collection.id}
                  className="flex flex-wrap items-center gap-3 px-5 py-3.5"
                >
                  <Layers className="size-4 shrink-0 text-gold/60" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm text-cream">
                        {collection.name}
                      </span>
                      <span className="font-mono text-[0.62rem] text-cream/35">
                        /{collection.slug}
                      </span>
                      {!collection.active ? (
                        <span className="inline-flex h-4.5 items-center border border-white/15 bg-white/5 px-1.5 text-[0.55rem] font-semibold tracking-[0.12em] text-cream/55 uppercase">
                          Hidden
                        </span>
                      ) : null}
                    </div>
                    <MicroLabel className="mt-0.5 block">
                      {collection._count.products} product
                      {collection._count.products === 1 ? "" : "s"} · order{" "}
                      {collection.sortOrder}
                    </MicroLabel>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startCollection(collection)}
                      className="p-1.5 text-cream/45 transition-colors hover:text-gold"
                      aria-label={`Edit ${collection.name}`}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </button>
                    <ConfirmButton
                      title={`Delete ${collection.name}?`}
                      description={`${collection._count.products} product(s) lose this collection and appear uncategorised in the storefront grid.`}
                      confirmLabel="Delete collection"
                      variant="ghost"
                      size="icon-sm"
                      onConfirm={() => removeCollection(collection.id)}
                      className="text-cream/45 hover:text-destructive"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </ConfirmButton>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel>
          <PanelHeader
            title="Categories"
            hint="Required for every product"
            action={
              <Button
                type="button"
                variant="gold-outline"
                size="xs"
                onClick={() => startCategory()}
              >
                <Plus className="size-3" aria-hidden />
                New category
              </Button>
            }
          />
          {categories.length === 0 ? (
            <p className="px-5 py-6 text-sm text-cream/45">
              No categories — create one before adding products.
            </p>
          ) : (
            <ul className="divide-y divide-ink-line">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="flex flex-wrap items-center gap-3 px-5 py-3.5"
                >
                  <FolderTree
                    className="size-4 shrink-0 text-gold/60"
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm text-cream">
                        {category.name}
                      </span>
                      <span className="font-mono text-[0.62rem] text-cream/35">
                        /{category.slug}
                      </span>
                      {!category.active ? (
                        <span className="inline-flex h-4.5 items-center border border-white/15 bg-white/5 px-1.5 text-[0.55rem] font-semibold tracking-[0.12em] text-cream/55 uppercase">
                          Hidden
                        </span>
                      ) : null}
                    </div>
                    <MicroLabel className="mt-0.5 block">
                      {category._count.products} product
                      {category._count.products === 1 ? "" : "s"}
                    </MicroLabel>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startCategory(category)}
                      className="p-1.5 text-cream/45 transition-colors hover:text-gold"
                      aria-label={`Edit ${category.name}`}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </button>
                    <ConfirmButton
                      title={`Delete ${category.name}?`}
                      description={
                        category._count.products > 0
                          ? `Move its ${category._count.products} product(s) first — categories with products cannot be deleted.`
                          : "The category is removed from the store for good."
                      }
                      confirmLabel="Delete category"
                      variant="ghost"
                      size="icon-sm"
                      onConfirm={() => removeCategory(category.id)}
                      className="text-cream/45 hover:text-destructive"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </ConfirmButton>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* --------------------------- collection dialog -------------------------- */}
      <Dialog open={collectionOpen} onOpenChange={setCollectionOpen}>
        <DialogContent className="max-w-lg rounded-none border-ink-line bg-[#131317] sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-mono text-xs tracking-[0.2em] text-cream uppercase">
              {editingCollection
                ? `Edit ${editingCollection.name}`
                : "New collection"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={onCollectionSubmit}
            noValidate
            className="max-h-[70vh] space-y-4 overflow-y-auto pr-1"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Name"
                required
                error={cErrors.name?.message}
                {...collectionForm.register("name")}
              />
              <TextField
                label="Slug"
                hint="Blank derives from the name"
                error={cErrors.slug?.message}
                {...collectionForm.register("slug")}
              />
              <TextField
                label="Tagline"
                className="sm:col-span-2"
                error={cErrors.tagline?.message}
                {...collectionForm.register("tagline")}
              />
              <TextAreaField
                label="Story"
                className="sm:col-span-2"
                rows={3}
                error={cErrors.story?.message}
                {...collectionForm.register("story")}
              />
              <TextField
                label="Cover image"
                className="sm:col-span-2"
                hint="Public path, e.g. /images/collections/…"
                error={cErrors.image?.message}
                {...collectionForm.register("image")}
              />
              <NumberField
                label="Sort order"
                min={0}
                hint="Lower sorts first"
                error={cErrors.sortOrder?.message}
                {...collectionForm.register("sortOrder", {
                  valueAsNumber: true,
                })}
              />
            </div>
            <CheckField
              label="Active"
              hint="Hidden collections stay in the admin but not on the storefront."
              checked={collectionActive ?? false}
              onCheckedChange={(v) => collectionForm.setValue("active", v)}
            />
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCollectionOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="gold" disabled={pending}>
                Save collection
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ---------------------------- category dialog --------------------------- */}
      <Dialog open={categoryOpen} onOpenChange={setCategoryOpen}>
        <DialogContent className="max-w-lg rounded-none border-ink-line bg-[#131317] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-mono text-xs tracking-[0.2em] text-cream uppercase">
              {editingCategory
                ? `Edit ${editingCategory.name}`
                : "New category"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={onCategorySubmit}
            noValidate
            className="max-h-[70vh] space-y-4 overflow-y-auto pr-1"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Name"
                required
                error={catErrors.name?.message}
                {...categoryForm.register("name")}
              />
              <TextField
                label="Slug"
                hint="Blank derives from the name"
                error={catErrors.slug?.message}
                {...categoryForm.register("slug")}
              />
              <TextAreaField
                label="Description"
                className="sm:col-span-2"
                rows={2}
                error={catErrors.description?.message}
                {...categoryForm.register("description")}
              />
              <TextField
                label="Image"
                className="sm:col-span-2"
                error={catErrors.image?.message}
                {...categoryForm.register("image")}
              />
            </div>
            <CheckField
              label="Active"
              hint="Inactive categories hide their products from storefront navigation."
              checked={categoryActive ?? false}
              onCheckedChange={(v) => categoryForm.setValue("active", v)}
            />
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCategoryOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="gold" disabled={pending}>
                Save category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
