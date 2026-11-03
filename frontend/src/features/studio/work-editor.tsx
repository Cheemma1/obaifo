"use client";

import Link from "@/i18n/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useErrorText } from "@/i18n/errors";
import { useI18n, useLocaleRouter } from "@/i18n/provider";
import { THEME_LABELS } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";
import { Cover } from "@/shared/ui/cover";
import { Arrow, Button, CloseIcon, Field, Notice, Skeleton, Textarea } from "@/shared/ui/primitives";
import { KindMotif } from "@/shared/ui/uli";
import { THEMES, type Theme, type WorkType } from "@/shared/types";
import { useDeleteWork, useParseManuscript, useSaveWork, useStudioWork, type DraftChapter, type StudioWork } from "./api";
import { StudioGate } from "./studio-gate";

interface Draft {
  title: string;
  type: WorkType;
  theme: Theme;
  synopsis: string;
  chapters: DraftChapter[];
}

const EMPTY: Draft = {
  title: "",
  type: "short",
  theme: "tortoise",
  synopsis: "",
  chapters: [{ title: "Isi 1", body: "" }],
};

const fromWork = (w: StudioWork): Draft => ({
  title: w.title,
  type: w.type,
  theme: w.theme,
  synopsis: w.synopsis,
  chapters: w.chapters.map((c) => ({ id: c.id, title: c.title, body: c.body })),
});

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

function Editor({ id }: { id: string | null }) {
  const router = useLocaleRouter();
  const { t, locale } = useI18n();
  const ed = t.studio.editor;
  const errorText = useErrorText();
  const { data: existing, isLoading } = useStudioWork(id);
  const save = useSaveWork();
  const remove = useDeleteWork();
  const parse = useParseManuscript();

  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [cover, setCover] = useState<File | null>(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const manuscriptInput = useRef<HTMLInputElement>(null);
  const loadedId = useRef<string | null>(null);

  useEffect(() => {
    if (existing && loadedId.current !== existing.id) {
      loadedId.current = existing.id;
      setDraft(fromWork(existing));
    }
  }, [existing]);

  const coverPreview = useMemo(() => (cover ? URL.createObjectURL(cover) : null), [cover]);
  useEffect(() => () => void (coverPreview && URL.revokeObjectURL(coverPreview)), [coverPreview]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const setChapter = (i: number, patch: Partial<DraftChapter>) =>
    setDraft((d) => ({ ...d, chapters: d.chapters.map((c, j) => (j === i ? { ...c, ...patch } : c)) }));
  const moveChapter = (i: number, dir: -1 | 1) =>
    setDraft((d) => {
      const next = [...d.chapters];
      const j = i + dir;
      if (j < 0 || j >= next.length) return d;
      [next[i], next[j]] = [next[j]!, next[i]!];
      return { ...d, chapters: next };
    });

  const totalWords = draft.chapters.reduce((n, c) => n + words(c.body), 0);
  const isPublished = existing?.status === "published";

  const submit = (publish: boolean) => {
    // A short tale is one continuous text; its single chapter carries the title.
    const chapters = draft.type === "short" ? [{ ...draft.chapters[0]!, title: draft.title || "Ifo" }] : draft.chapters;
    const form = new FormData();
    form.set("title", draft.title);
    form.set("type", draft.type);
    form.set("theme", draft.theme);
    form.set("synopsis", draft.synopsis);
    form.set("publish", String(publish));
    form.set("chapters", JSON.stringify(chapters));
    if (cover) form.set("cover", cover);
    if (removeCover && !cover) form.set("removeCover", "true");

    save.mutate(
      { id: id ?? undefined, form },
      {
        onSuccess: (work) => {
          setCover(null);
          setRemoveCover(false);
          setSaved(publish ? ed.savedPublished : ed.savedDraft);
          if (!id) router.replace(`/studio/${work.id}`);
        },
      },
    );
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit(true);
  };

  if (id && isLoading) return <Skeleton className="mx-5 mt-12 h-[60vh] md:mx-10" />;

  const shownCover = coverPreview ?? (removeCover ? null : existing?.coverUrl ?? null);

  return (
    <form onSubmit={onSubmit} className="tone-nzu mx-auto grid max-w-[90rem] gap-12 px-5 pb-28 pt-10 md:px-10 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <Link href="/studio" className="inline-flex min-h-11 items-center gap-2 font-semibold hover:underline">
          <Arrow className="rotate-180" />
          {ed.back.replace(/^←\s*/, "")}
        </Link>

        <input
          value={draft.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder={ed.titlePlaceholder}
          required
          maxLength={140}
          aria-label={ed.titleAria}
          lang="ig"
          className="tale mt-6 w-full border-b-4 border-char bg-transparent pb-3 text-[clamp(2.4rem,5.5vw,4.5rem)] font-semibold leading-[1.05] outline-none placeholder:text-char/30 focus:border-earth"
        />

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-b-2 border-rule pb-4">
          <h2 className="text-xl font-extrabold">{draft.type === "short" ? ed.storyText : ed.chapters(draft.chapters.length)}</h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="tabular-nums text-muted">{ed.words(totalWords.toLocaleString())}</span>
            <button type="button" className="min-h-10 border-2 border-char px-3 font-semibold hover:bg-nzu-deep" onClick={() => manuscriptInput.current?.click()} disabled={parse.isPending}>
              {parse.isPending ? ed.reading : ed.import}
            </button>
            <input
              ref={manuscriptInput}
              type="file"
              accept=".txt,.md,text/plain,text/markdown"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                parse.mutate(file, {
                  onSuccess: ({ chapters }) =>
                    setDraft((d) => ({
                      ...d,
                      type: chapters.length > 1 ? "long" : d.type,
                      chapters: d.type === "short" && chapters.length === 1 ? [{ title: d.title, body: chapters[0]!.body }] : chapters,
                    })),
                });
              }}
            />
          </div>
        </div>
        {parse.isError && (
          <div className="mt-4">
            <Notice tone="error">{errorText(parse.error)}</Notice>
          </div>
        )}
        <p className="mt-3 text-sm text-muted">{ed.importHint}</p>
        <p className="mt-1 text-sm font-semibold text-earth">{ed.igboOnly}</p>

        <ol className="mt-6 space-y-10">
            {(draft.type === "short" ? draft.chapters.slice(0, 1) : draft.chapters).map((chapter, i) => (
              <li key={chapter.id ?? `new-${i}`} className="group">
                {draft.type === "long" && (
                  <div className="flex items-center gap-4">
                    <span className="w-6 text-sm font-bold tabular-nums text-earth">{i + 1}</span>
                    <input
                      value={chapter.title}
                      onChange={(e) => setChapter(i, { title: e.target.value })}
                      aria-label={ed.chapterAria(i + 1)}
                      lang="ig"
                      required
                      className="tale min-w-0 flex-1 border-b-2 border-transparent bg-transparent text-2xl font-semibold outline-none hover:border-rule focus:border-char"
                    />
                    <div className="flex gap-1">
                      <button type="button" onClick={() => moveChapter(i, -1)} aria-label={ed.moveUp} className="flex size-10 items-center justify-center border-2 border-rule hover:border-char"><Arrow className="-rotate-90" /></button>
                      <button type="button" onClick={() => moveChapter(i, 1)} aria-label={ed.moveDown} className="flex size-10 items-center justify-center border-2 border-rule hover:border-char"><Arrow className="rotate-90" /></button>
                      {draft.chapters.length > 1 && (
                        <button
                          type="button"
                          onClick={() => set("chapters", draft.chapters.filter((_, j) => j !== i))}
                          className="flex size-10 items-center justify-center border-2 border-rule hover:border-earth hover:text-earth"
                          aria-label={ed.remove}
                        >
                          <CloseIcon className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <Textarea
                  value={chapter.body}
                  onChange={(e) => setChapter(i, { body: e.target.value })}
                  placeholder={ed.bodyPlaceholder}
                  lang="ig"
                  rows={draft.type === "short" ? 18 : 10}
                  required
                  aria-label={draft.type === "short" ? ed.storyText : ed.chapterTextAria(i + 1)}
                  className="tale mt-3 min-h-48 text-lg leading-[1.75] [field-sizing:content]"
                />
              </li>
            ))}
        </ol>

        {draft.type === "long" && (
          <button
            type="button"
            onClick={() => set("chapters", [...draft.chapters, { title: ed.newChapter(draft.chapters.length + 1), body: "" }])}
            className="mt-10 min-h-16 w-full border-2 border-dashed border-char/50 font-semibold transition-colors hover:border-char hover:bg-nzu-deep"
          >
            {ed.addChapter}
          </button>
        )}
      </div>

      <aside className="lg:col-span-4">
        <div className="space-y-8 lg:sticky lg:top-24">
          <div className="mx-auto max-w-56 lg:max-w-none">
            <Cover slug={existing?.slug ?? (draft.title || "new")} title={draft.title || ed.untitled} theme={draft.theme} coverUrl={shownCover} className="border-4 border-char" />
            <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm font-semibold">
              <label className="link cursor-pointer focus-within:outline-2">
                {shownCover ? ed.replaceCover : ed.uploadCover}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    setCover(e.target.files?.[0] ?? null);
                    setRemoveCover(false);
                  }}
                />
              </label>
              {shownCover && (
                <button
                  type="button"
                  className="link text-muted"
                  onClick={() => {
                    setCover(null);
                    setRemoveCover(true);
                  }}
                >
                  {ed.generated}
                </button>
              )}
            </div>
          </div>

          <fieldset>
            <legend className="text-sm font-semibold">{ed.format}</legend>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(["short", "long"] as const).map((ty) => (
                <button
                  key={ty}
                  type="button"
                  aria-pressed={draft.type === ty}
                  onClick={() => set("type", ty)}
                  className={cn("min-h-12 border-2 text-sm font-semibold transition-colors", draft.type === ty ? "border-char bg-char text-nzu" : "border-char/40 hover:border-char")}
                >
                  {ty === "short" ? ed.short : ed.long}
                </button>
              ))}
            </div>
          </fieldset>

          <Field label={ed.kind} hint={ed.kindHint}>
            <div className="flex items-center gap-3">
            <KindMotif theme={draft.theme} className="size-12 shrink-0 text-earth" />
            <select value={draft.theme} onChange={(e) => set("theme", e.target.value as Theme)} className="min-h-12 w-full border-2 border-char/70 bg-nzu px-3 text-base font-semibold outline-none hover:border-char focus:border-char">
              {THEMES.map((g) => (
                <option key={g} value={g}>
                  {THEME_LABELS[g][locale]}
                </option>
              ))}
            </select>
            </div>
          </Field>

          <Field label={ed.synopsis} hint={ed.synopsisHint}>
            <Textarea lang="ig" value={draft.synopsis} onChange={(e) => set("synopsis", e.target.value)} rows={4} required minLength={10} maxLength={1200} />
          </Field>

          {save.isError && <Notice tone="error">{errorText(save.error)}</Notice>}
          {saved && !save.isError && <Notice tone="success">{saved}</Notice>}

          <div className="grid gap-3">
            <Button type="submit" arrow disabled={save.isPending}>
              {save.isPending ? ed.saving : isPublished ? ed.update : ed.publish}
            </Button>
            <Button type="button" variant="outline" disabled={save.isPending} onClick={() => submit(false)}>
              {isPublished ? ed.unpublish : ed.draft}
            </Button>
            {isPublished && existing && (
              <Link href={`/stories/${existing.slug}`} className="link text-center font-semibold">
                {ed.viewLive}
              </Link>
            )}
          </div>

          {id && (
            <button
              type="button"
              className="min-h-11 text-sm font-semibold text-earth hover:underline"
              disabled={remove.isPending}
              onClick={() => {
                if (window.confirm(ed.confirmDelete)) {
                  remove.mutate(id, { onSuccess: () => router.push("/studio") });
                }
              }}
            >
              {ed.delete}
            </button>
          )}
        </div>
      </aside>
    </form>
  );
}

export function NewWorkEditor() {
  return <StudioGate next="/studio/new">{() => <Editor id={null} />}</StudioGate>;
}

export function EditWorkEditor() {
  const { id } = useParams<{ id: string }>();
  return <StudioGate next={`/studio/${id}`}>{() => <Editor key={id} id={id} />}</StudioGate>;
}
