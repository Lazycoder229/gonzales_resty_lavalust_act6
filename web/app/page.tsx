"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Check,
  ChevronDown,
  CircleHelp,
  LoaderCircle,
  LogOut,
  Package,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { apiFetch, authenticate, readSession, saveSession, signOut } from "@/lib/api"
import type { Product, Session } from "@/lib/api"

type ProductDraft = { product_name: string; description: string; price: string; quantity: string }
const emptyDraft: ProductDraft = { product_name: "", description: "", price: "", quantity: "" }
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })

function formatDate(value: string) {
  const date = new Date(value.replace(" ", "T"))
  return Number.isNaN(date.valueOf())
    ? "Recently added"
    : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date)
}

function LoginScreen({ onAuthenticated }: { onAuthenticated: (session: Session) => void }) {
  const [registering, setRegistering] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setLoading(true)
    try {
      const result = await authenticate(registering ? "register" : "login", {
        ...(registering ? { name } : {}),
        email,
        password,
      })
      onAuthenticated(result)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not connect to the API.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-svh bg-[#f5f5f1] lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-[#1e322c] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div className="absolute -right-32 top-1/4 size-[34rem] rounded-full border border-white/10" />
        <div className="absolute -right-12 top-[30%] size-[24rem] rounded-full border border-white/10" />
        <div className="absolute -right-4 top-[35%] size-[16rem] rounded-full border border-white/10" />
        <div className="relative flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-[#d3f17c] text-[#20312a]"><Boxes size={20} /></div>
          <span className="text-sm font-semibold tracking-[0.16em]">STOCKROOM</span>
        </div>
        <div className="relative max-w-lg pb-10">
          <div className="mb-6 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[#cde88d]"><Sparkles size={14} /> A clearer view of your inventory</div>
          <h1 className="text-5xl font-medium leading-[1.08] tracking-[-0.055em] xl:text-6xl">The details that keep your business moving.</h1>
          <p className="mt-6 max-w-md text-base leading-7 text-white/65">One calm place to keep products, prices, and stock levels in order.</p>
          <div className="mt-14 flex items-center gap-3 text-sm text-white/55"><ShieldCheck size={17} className="text-[#cde88d]" /> Your workspace is protected by secure sign in</div>
        </div>
        <div className="relative flex items-center justify-between text-xs text-white/40"><span>Inventory, thoughtfully organized.</span><span>01 / 02</span></div>
      </section>

      <section className="flex min-h-svh flex-col px-6 py-7 sm:px-10 lg:px-14">
        <div className="flex items-center gap-3 lg:hidden">
          <div className="grid size-9 place-items-center rounded-xl bg-[#243b33] text-[#d3f17c]"><Boxes size={18} /></div>
          <span className="text-xs font-bold tracking-[0.16em]">STOCKROOM</span>
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-[#dedfd7] bg-white/70 px-3 py-1.5 text-xs text-[#6b736b]"><span className="size-1.5 rounded-full bg-[#78964a]" /> Workspace access</div>
          <h2 className="text-3xl font-medium tracking-[-0.045em] text-[#20251f]">{registering ? "Create your account" : "Welcome back"}</h2>
          <p className="mt-2 text-sm leading-6 text-[#72776f]">{registering ? "Set up your workspace to start managing products." : "Sign in to see what’s in stock and what needs attention."}</p>
          <form className="mt-8 space-y-4" onSubmit={submit}>
            {registering && <label className="block text-sm font-medium text-[#30372f]">Your name<input required maxLength={100} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Morgan" className="mt-2 h-11 w-full rounded-xl border border-[#dedfd7] bg-white px-3.5 text-sm outline-none transition focus:border-[#708b4c] focus:ring-4 focus:ring-[#708b4c]/10" /></label>}
            <label className="block text-sm font-medium text-[#30372f]">Email address<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" className="mt-2 h-11 w-full rounded-xl border border-[#dedfd7] bg-white px-3.5 text-sm outline-none transition focus:border-[#708b4c] focus:ring-4 focus:ring-[#708b4c]/10" /></label>
            <label className="block text-sm font-medium text-[#30372f]">Password<input required type="password" minLength={registering ? 10 : 1} autoComplete={registering ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={registering ? "At least 10 characters" : "Enter your password"} className="mt-2 h-11 w-full rounded-xl border border-[#dedfd7] bg-white px-3.5 text-sm outline-none transition focus:border-[#708b4c] focus:ring-4 focus:ring-[#708b4c]/10" /></label>
            {error && <div role="alert" className="rounded-xl border border-[#f0d3c8] bg-[#fff5f1] px-3.5 py-3 text-sm leading-5 text-[#a14b35]">{error}</div>}
            <Button disabled={loading} className="mt-2 h-11 w-full rounded-xl bg-[#243b33] text-sm text-white hover:bg-[#304b41]">
              {loading ? <LoaderCircle className="animate-spin" /> : null}{registering ? "Create account" : "Sign in"}<ArrowRight size={16} />
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-[#767a72]">{registering ? "Already have an account?" : "New to Stockroom?"}{" "}<button className="font-medium text-[#293c33] underline decoration-[#bac6aa] underline-offset-4 hover:text-[#637a43]" onClick={() => { setRegistering(!registering); setError("") }}>{registering ? "Sign in" : "Create an account"}</button></div>
          <div className="mt-10 flex items-start gap-2.5 rounded-xl bg-[#eceee7] p-3.5 text-xs leading-5 text-[#6b7168]"><CircleHelp size={15} className="mt-0.5 shrink-0" /><span>Your account is secured with the LavaLust API. Session tokens are kept in this browser tab.</span></div>
        </div>
        <footer className="flex items-center justify-between text-xs text-[#898d85]"><span>© 2026 Stockroom</span><span>Inventory management</span></footer>
      </section>
    </main>
  )
}

function ProductDialog({
  product,
  onClose,
  onSave,
}: {
  product: Product | null | undefined
  onClose: () => void
  onSave: (draft: ProductDraft, id?: number) => Promise<void>
}) {
  const [draft, setDraft] = useState<ProductDraft>(product ? {
    product_name: product.product_name,
    description: product.description,
    price: product.price,
    quantity: String(product.quantity),
  } : emptyDraft)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setSaving(true)
    try {
      await onSave(draft, product?.id)
      onClose()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save this product.")
    } finally {
      setSaving(false)
    }
  }

  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#15221e]/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section role="dialog" aria-modal="true" aria-labelledby="product-dialog-title" className="w-full max-w-lg rounded-t-3xl border border-[#e4e5de] bg-[#fbfbf8] p-6 shadow-2xl sm:rounded-3xl sm:p-7">
      <div className="flex items-start justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a8a68]">Product details</p><h2 id="product-dialog-title" className="mt-2 text-2xl font-medium tracking-[-0.04em]">{product ? "Edit product" : "Add a product"}</h2><p className="mt-1 text-sm text-[#777c73]">Keep the product information up to date.</p></div><button aria-label="Close" onClick={onClose} className="grid size-9 place-items-center rounded-full text-[#73796f] hover:bg-[#eff0ea]"><X size={18} /></button></div>
      <form className="mt-6 space-y-4" onSubmit={submit}>
        <label className="block text-sm font-medium">Product name<input required maxLength={100} autoFocus value={draft.product_name} onChange={(event) => setDraft({ ...draft, product_name: event.target.value })} placeholder="e.g. Studio Mug" className="mt-2 h-11 w-full rounded-xl border border-[#dedfd7] bg-white px-3.5 text-sm outline-none focus:border-[#708b4c] focus:ring-4 focus:ring-[#708b4c]/10" /></label>
        <label className="block text-sm font-medium">Description<textarea required rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="A short description of this item" className="mt-2 w-full resize-none rounded-xl border border-[#dedfd7] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#708b4c] focus:ring-4 focus:ring-[#708b4c]/10" /></label>
        <div className="grid grid-cols-2 gap-3"><label className="block text-sm font-medium">Price<input required type="number" min="0" step="0.01" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} placeholder="0.00" className="mt-2 h-11 w-full rounded-xl border border-[#dedfd7] bg-white px-3.5 text-sm outline-none focus:border-[#708b4c] focus:ring-4 focus:ring-[#708b4c]/10" /></label><label className="block text-sm font-medium">Quantity<input required type="number" min="0" step="1" value={draft.quantity} onChange={(event) => setDraft({ ...draft, quantity: event.target.value })} placeholder="0" className="mt-2 h-11 w-full rounded-xl border border-[#dedfd7] bg-white px-3.5 text-sm outline-none focus:border-[#708b4c] focus:ring-4 focus:ring-[#708b4c]/10" /></label></div>
        {error && <p role="alert" className="rounded-xl bg-[#fff2ee] px-3.5 py-3 text-sm text-[#a14b35]">{error}</p>}
        <div className="flex gap-3 pt-2"><Button type="button" variant="outline" onClick={onClose} className="h-11 flex-1 rounded-xl">Cancel</Button><Button disabled={saving} className="h-11 flex-1 rounded-xl bg-[#243b33] text-white hover:bg-[#304b41]">{saving ? <LoaderCircle className="animate-spin" /> : <Check size={16} />}{product ? "Save changes" : "Add product"}</Button></div>
      </form>
    </section>
  </div>
}

export default function Page() {
  const [session, setSession] = useState<Session | null>(null)
  const [restored, setRestored] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "low" | "out">("all")
  const [dialog, setDialog] = useState<Product | null | undefined>(undefined)
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const [notice, setNotice] = useState("")
  const [pageError, setPageError] = useState("")

  useEffect(() => {
    setSession(readSession())
    setRestored(true)
  }, [])

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setPageError("")
    try {
      const result = await apiFetch<{ data: Product[] }>("/products")
      setProducts(result.data)
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Could not load products."
      setPageError(message)
      if (message.includes("Sign in again")) setSession(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session) void loadProducts()
  }, [session, loadProducts])

  const lowStock = products.filter((product) => product.quantity > 0 && product.quantity <= 5).length
  const outOfStock = products.filter((product) => product.quantity === 0).length
  const inventoryValue = products.reduce((total, product) => total + Number(product.price) * product.quantity, 0)
  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesSearch = `${product.product_name} ${product.description}`.toLowerCase().includes(search.toLowerCase().trim())
    const matchesFilter = filter === "all" || (filter === "low" && product.quantity > 0 && product.quantity <= 5) || (filter === "out" && product.quantity === 0)
    return matchesSearch && matchesFilter
  }), [products, search, filter])

  function authenticated(next: Session) {
    saveSession(next)
    setSession(next)
  }

  async function saveProduct(draft: ProductDraft, id?: number) {
    const payload = { ...draft, price: Number(draft.price), quantity: Number(draft.quantity) }
    const result = await apiFetch<{ message: string; data: Product }>(id ? `/products/${id}` : "/products", {
      method: id ? "PATCH" : "POST",
      body: JSON.stringify(payload),
    })
    setProducts((current) => id ? current.map((item) => item.id === id ? result.data : item) : [result.data, ...current])
    setNotice(id ? "Product changes saved." : "Product added to your inventory.")
  }

  async function removeProduct(product: Product) {
    setDeleting(true)
    setDeleteError("")
    try {
      await apiFetch<{ message: string }>(`/products/${product.id}`, { method: "DELETE" })
      setProducts((current) => current.filter((item) => item.id !== product.id))
      setNotice("Product deleted.")
      setPendingDelete(null)
    } catch (reason) {
      setDeleteError(reason instanceof Error ? reason.message : "Could not delete this product.")
    } finally {
      setDeleting(false)
    }
  }

  async function logout() {
    await signOut()
    setSession(null)
    setProducts([])
  }

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(""), 3200)
    return () => window.clearTimeout(timer)
  }, [notice])

  if (!restored) return <div className="grid min-h-svh place-items-center bg-[#f5f5f1]"><LoaderCircle className="animate-spin text-[#627b47]" /></div>
  if (!session) return <LoginScreen onAuthenticated={authenticated} />

  return <main className="min-h-svh bg-[#f5f5f1] text-[#252a24]">
    <header className="sticky top-0 z-20 border-b border-[#e6e7e0] bg-[#f9f9f6]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-5 sm:px-8 xl:px-12">
        <div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-xl bg-[#243b33] text-[#d3f17c]"><Boxes size={18} /></div><div><div className="text-xs font-bold tracking-[0.16em]">STOCKROOM</div><div className="mt-0.5 text-[10px] text-[#969a91]">PRODUCTS / OVERVIEW</div></div></div>
        <div className="flex items-center gap-2 sm:gap-4"><div className="hidden items-center gap-2 rounded-full border border-[#e4e5de] bg-white px-3 py-1.5 text-xs text-[#70776c] sm:flex"><span className="size-1.5 rounded-full bg-[#86a85b]" /> All systems operational</div><div className="h-7 w-px bg-[#e3e4dd]" /><div className="hidden text-right sm:block"><div className="text-xs font-medium">{session.user.name}</div><div className="text-[10px] text-[#898e85]">Workspace member</div></div><button aria-label="Sign out" onClick={() => void logout()} className="grid size-9 place-items-center rounded-full border border-[#e1e3dc] bg-white text-[#636c61] transition hover:bg-[#eef0e9]"><LogOut size={16} /></button></div>
      </div>
    </header>

    <div className="mx-auto max-w-[1440px] px-5 pb-12 pt-8 sm:px-8 sm:pt-11 xl:px-12">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7a8a68]"><span className="size-1.5 rounded-full bg-[#89a959]" /> Your workspace</div><h1 className="text-3xl font-medium tracking-[-0.05em] sm:text-[2.55rem]">Product inventory</h1><p className="mt-2 text-sm text-[#797e75]">A simple snapshot of what you have on hand.</p></div><Button onClick={() => setDialog(null)} className="h-10 gap-2 self-start rounded-xl bg-[#243b33] px-4 text-white hover:bg-[#304b41] sm:self-auto"><Plus size={16} /> Add product</Button></div>

      <section aria-label="Inventory summary" className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#e7e8e2] bg-white p-5"><div className="flex items-center justify-between"><span className="text-xs font-medium text-[#747a70]">Total products</span><span className="grid size-8 place-items-center rounded-xl bg-[#edf1e6] text-[#637d47]"><Package size={16} /></span></div><div className="mt-4 flex items-end justify-between"><span className="text-3xl font-medium tracking-[-0.055em]">{products.length.toString().padStart(2, "0")}</span><span className="flex items-center gap-1 text-[11px] text-[#899087]">Active items <ArrowUpRight size={12} /></span></div></div>
        <div className="rounded-2xl border border-[#e7e8e2] bg-white p-5"><div className="flex items-center justify-between"><span className="text-xs font-medium text-[#747a70]">Inventory value</span><span className="grid size-8 place-items-center rounded-xl bg-[#edf1e6] text-[#637d47]"><TrendingUp size={16} /></span></div><div className="mt-4 flex items-end justify-between"><span className="text-3xl font-medium tracking-[-0.055em]">{money.format(inventoryValue)}</span><span className="text-[11px] text-[#899087]">At current prices</span></div></div>
        <button onClick={() => setFilter(filter === "low" ? "all" : "low")} className={`rounded-2xl border p-5 text-left transition ${filter === "low" ? "border-[#d9c694] bg-[#fbf8ef]" : "border-[#e7e8e2] bg-white hover:border-[#ddd8c7]"}`}><div className="flex items-center justify-between"><span className="text-xs font-medium text-[#747a70]">Running low</span><span className="grid size-8 place-items-center rounded-xl bg-[#f6f0dc] text-[#9e7d3f]"><ArrowDownRight size={16} /></span></div><div className="mt-4 flex items-end justify-between"><span className="text-3xl font-medium tracking-[-0.055em]">{lowStock.toString().padStart(2, "0")}</span><span className="text-[11px] text-[#9a875e]">5 units or fewer</span></div></button>
        <button onClick={() => setFilter(filter === "out" ? "all" : "out")} className={`rounded-2xl border p-5 text-left transition ${filter === "out" ? "border-[#edc9bd] bg-[#fff5f1]" : "border-[#e7e8e2] bg-white hover:border-[#e7d6d0]"}`}><div className="flex items-center justify-between"><span className="text-xs font-medium text-[#747a70]">Out of stock</span><span className="grid size-8 place-items-center rounded-xl bg-[#faeae4] text-[#aa5a41]"><Boxes size={16} /></span></div><div className="mt-4 flex items-end justify-between"><span className="text-3xl font-medium tracking-[-0.055em]">{outOfStock.toString().padStart(2, "0")}</span><span className="text-[11px] text-[#a16a58]">Needs restocking</span></div></button>
      </section>

      <section className="mt-7 overflow-hidden rounded-2xl border border-[#e5e6df] bg-white">
        <div className="flex flex-col justify-between gap-4 border-b border-[#edeee8] px-5 py-4 sm:flex-row sm:items-center sm:px-6"><div><div className="flex items-center gap-2 text-sm font-semibold">All products <span className="rounded-full bg-[#eff1eb] px-2 py-0.5 text-[10px] font-medium text-[#687361]">{visibleProducts.length}</span></div><div className="mt-1 text-xs text-[#92968e]">Manage and keep track of your stock.</div></div><div className="flex flex-col gap-2 sm:flex-row"><label className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#969b91]" /><input aria-label="Search products" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" className="h-9 w-full rounded-xl border border-[#e6e7e1] bg-[#fbfbf9] pl-9 pr-3 text-xs outline-none focus:border-[#84996b] sm:w-52" /></label><button onClick={() => setFilter(filter === "all" ? "low" : filter === "low" ? "out" : "all")} className="flex h-9 items-center justify-between gap-3 rounded-xl border border-[#e6e7e1] bg-[#fbfbf9] px-3 text-xs text-[#596156] sm:justify-start">{filter === "all" ? "All stock" : filter === "low" ? "Running low" : "Out of stock"}<ChevronDown size={14} /></button></div></div>

        {pageError && <div role="alert" className="mx-5 mt-4 flex items-center justify-between gap-4 rounded-xl border border-[#efd3c9] bg-[#fff5f1] px-4 py-3 text-sm text-[#a14b35] sm:mx-6"><span>{pageError}</span><button aria-label="Dismiss" onClick={() => setPageError("")}><X size={15} /></button></div>}
        <div className="hidden grid-cols-[minmax(220px,1.7fr)_minmax(160px,1fr)_0.7fr_0.7fr_116px] gap-4 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#999d94] md:grid"><span>Product</span><span>Added</span><span>Price</span><span>Quantity</span><span className="text-right">Actions</span></div>
        {loading ? <div className="grid min-h-56 place-items-center text-sm text-[#858b80]"><span className="flex items-center gap-2"><LoaderCircle className="animate-spin" size={16} />Loading your inventory</span></div> : visibleProducts.length ? <div className="divide-y divide-[#eff0eb]">{visibleProducts.map((product, index) => {
          const status = product.quantity === 0 ? "out" : product.quantity <= 5 ? "low" : "in"
          return <article key={product.id} className="grid gap-3 px-5 py-4 transition hover:bg-[#fcfcfa] md:grid-cols-[minmax(220px,1.7fr)_minmax(160px,1fr)_0.7fr_0.7fr_116px] md:items-center md:gap-4 md:px-6">
            <div className="flex min-w-0 items-center gap-3"><div className={`grid size-10 shrink-0 place-items-center rounded-xl text-xs font-semibold ${["bg-[#edf0e6] text-[#657b4d]", "bg-[#f1ece4] text-[#92754b]", "bg-[#e9eff0] text-[#5a7478]", "bg-[#f2e9e8] text-[#936662]"][index % 4]}`}><Package size={17} /></div><div className="min-w-0"><div className="truncate text-sm font-medium">{product.product_name}</div><div className="mt-1 line-clamp-1 text-xs text-[#8c9188]">{product.description}</div></div></div>
            <div className="hidden text-xs text-[#737a70] md:block">{formatDate(product.created_at)}</div><div className="flex items-center justify-between text-sm md:block"> <span className="text-[11px] text-[#9a9e96] md:hidden">Price</span><span>{money.format(Number(product.price))}</span></div>
            <div className="flex items-center justify-between md:justify-start"><span className="text-[11px] text-[#9a9e96] md:hidden">Available</span><span className="flex items-center gap-2"><span className="text-sm">{product.quantity} <span className="text-xs text-[#969a91]">units</span></span><span className={`hidden rounded-full px-2 py-1 text-[10px] font-medium sm:inline-flex ${status === "in" ? "bg-[#edf3e8] text-[#587744]" : status === "low" ? "bg-[#f8f1de] text-[#957743]" : "bg-[#faece7] text-[#a95f48]"}`}>{status === "in" ? "In stock" : status === "low" ? "Low stock" : "Out of stock"}</span></span></div>
            <div className="flex items-center justify-end gap-1 border-t border-[#f0f1ec] pt-2 md:border-0 md:pt-0"><button aria-label={`Edit ${product.product_name}`} onClick={() => setDialog(product)} className="grid size-8 place-items-center rounded-lg text-[#727b70] hover:bg-[#eef0e9] hover:text-[#344b37]"><Pencil size={15} /></button><button aria-label={`Delete ${product.product_name}`} onClick={() => { setDeleteError(""); setPendingDelete(product) }} className="grid size-8 place-items-center rounded-lg text-[#95968f] hover:bg-[#fff0eb] hover:text-[#ae5840]"><Trash2 size={15} /></button></div>
          </article>
        })}</div> : <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center"><div className="grid size-12 place-items-center rounded-2xl bg-[#eff1eb] text-[#728267]"><Package size={20} /></div><h3 className="mt-4 text-sm font-medium">{search || filter !== "all" ? "No products match that view" : "Your inventory is ready for its first product"}</h3><p className="mt-1 max-w-sm text-xs leading-5 text-[#8a8f86]">{search || filter !== "all" ? "Try a different search or stock filter." : "Add the products you carry to see quantities, prices, and stock status here."}</p>{!search && filter === "all" && <Button onClick={() => setDialog(null)} variant="outline" className="mt-4 h-9 rounded-xl"><Plus size={15} /> Add your first product</Button>}</div>}
        <div className="flex flex-col justify-between gap-2 border-t border-[#edeee8] px-5 py-3 text-[11px] text-[#989c93] sm:flex-row sm:items-center sm:px-6"><span>Showing {visibleProducts.length} of {products.length} products</span><span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-[#89a959]" /> Synced with your workspace <ArrowRight size={12} /></span></div>
      </section>
      <footer className="mt-5 flex items-center justify-between text-[10px] text-[#a0a39b]"><span>STOCKROOM · INVENTORY MANAGEMENT</span><span>Securely powered by LavaLust API</span></footer>
    </div>
    {dialog !== undefined && <ProductDialog product={dialog} onClose={() => setDialog(undefined)} onSave={saveProduct} />}
    <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => { if (!open && !deleting) { setPendingDelete(null); setDeleteError("") } }}>
      <AlertDialogContent>
        <div className="grid size-11 place-items-center rounded-xl bg-[#fff0eb] text-[#ae5840]"><Trash2 size={18} /></div>
        <div className="space-y-1.5">
          <AlertDialogTitle>Delete this product?</AlertDialogTitle>
          <AlertDialogDescription>Delete “{pendingDelete?.product_name}” from your inventory? This action cannot be undone.</AlertDialogDescription>
        </div>
        {deleteError && <p role="alert" className="rounded-xl bg-[#fff2ee] px-3.5 py-3 text-sm text-[#a14b35]">{deleteError}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <Button disabled={deleting || !pendingDelete} onClick={() => pendingDelete && void removeProduct(pendingDelete)} className="h-10 rounded-xl bg-[#a94e3c] px-4 text-white hover:bg-[#913d30]">{deleting ? <LoaderCircle className="animate-spin" /> : <Trash2 size={15} />}{deleting ? "Deleting…" : "Delete product"}</Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
    {notice && <div role="status" className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-xl border border-[#dce4d2] bg-white px-4 py-3 text-sm text-[#40583b] shadow-lg"><Check size={16} />{notice}</div>}
  </main>
}
