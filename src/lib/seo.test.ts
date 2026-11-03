import { describe, it, expect } from "vitest";
import { canonicalUrl, ilhaCourseLd, cleanLd } from "./seo";
import { CURSO_ILHA } from "@/content/cursos/ilha";

const fim = new Date(CURSO_ILHA.precos.fimLote1).getTime();

describe("canonical", () => {
  it("home mantém barra; demais sem barra, query ou hash", () => {
    expect(canonicalUrl("/")).toBe("https://jeffersonlobo.tech/");
    expect(canonicalUrl("/blog/?x=1#y")).toBe("https://jeffersonlobo.tech/blog");
  });
});

describe("Offer da Ilha", () => {
  it("no Lote 1: preço do lote 1 e válido até o fim do lote", () => {
    const o = (ilhaCourseLd(fim - 1000) as any).offers;
    expect(o.price).toBe(CURSO_ILHA.precos.lote1.toFixed(2));
    expect(o.priceCurrency).toBe("BRL");
    expect(o.priceValidUntil).toBe(CURSO_ILHA.precos.fimLote1);
  });
  it("após o fim do lote: preço do lote 2 e sem data vencida", () => {
    const o = (ilhaCourseLd(fim + 1000) as any).offers;
    expect(o.price).toBe(CURSO_ILHA.precos.lote2.toFixed(2));
    expect(o.priceValidUntil).toBeUndefined();
  });
  it("provider é a Academia", () => {
    expect((ilhaCourseLd(fim - 1) as any).provider.name).toBe("Academia jeffersonlobo.tech");
  });
});

it("cleanLd remove campos vazios", () => {
  expect(cleanLd({ a: "", b: undefined, c: [], d: { e: null }, f: "x" })).toEqual({ f: "x" });
});
