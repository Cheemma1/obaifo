import { hashPassword } from "better-auth/crypto";
import type { Theme, Work, WorkType } from "../types";
import { slugify, wordCount } from "../utils/text";
import { prisma } from "./client";

/**
 * Sample content for local development. Storytellers are fictional; the tales
 * are short retellings of well-known Igbo ifo (plus one original) written as
 * placeholders — have a native speaker review them, or replace them with real
 * submissions. Demo logins (password "agumagu123"):
 *   reader@agumagu.test   — free reader
 *   author@agumagu.test   — storyteller with tales in the studio
 */

const DEMO_PASSWORD = "agumagu123";
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);

const p = (...paragraphs: string[]) => paragraphs.join("\n\n");

type SeedWork = {
  title: string;
  author: number;
  type: WorkType;
  theme: Theme;
  synopsis: string;
  featured?: boolean;
  draft?: boolean;
  reads: number;
  age: number;
  chapters: [string, string][];
};

const AUTHORS = [
  {
    name: "Chidinma Eze",
    email: "author@agumagu.test",
    bio: "Ọ na-ede ifo nne nne ya kọọrọ ya n'ọnwa. Writes down the tales her grandmother told by moonlight in Nsukka.",
    hue: 14,
  },
  {
    name: "Obiora Nwachukwu",
    email: "obiora@agumagu.test",
    bio: "Onye nkuzi na Awka. A teacher collecting the Mbe stories his pupils' grandparents still remember.",
    hue: 36,
  },
  {
    name: "Nkechi Agu",
    email: "nkechi@agumagu.test",
    bio: "Ọ na-akọ ifo nwere egwu. Song tales and spirit tales, the way they were sung in Ngwa compounds.",
    hue: 330,
  },
  {
    name: "Ifeanyi Okafor",
    email: "ifeanyi@agumagu.test",
    bio: "Engineer in Lagos, storyteller at heart. Retells the hero tales — Ojadili first among them.",
    hue: 200,
  },
];

const WORKS: SeedWork[] = [
  {
    title: "Mmiri Ozuzo na Nwa Nnụnụ",
    author: 0,
    type: "short",
    theme: "wisdom",
    synopsis: "Nwa nnụnụ nọ naanị ya n'oge mmiri ozuzo mụtara ihe ndidi pụtara site n'aka Mbe.",
    featured: true,
    reads: 1240,
    age: 3,
    chapters: [
      [
        "Mmiri Ozuzo na Nwa Nnụnụ",
        p(
          "Otu ụbọchị n'oge udu mmiri, mmiri ozuzo malitere izo n'obodo Umuọma. Nwa nnụnụ nta nọ n'elu osisi ụdara, na-ele ka mmiri na-adakwasị akwụkwọ osisi ahụ.",
          "Nne ya gara ịchọ nri n'ụtụtụ, ma ọ lọtabeghị. Nwa nnụnụ ahụ tụrụ egwu. Ọ sịrị n'obi ya, “Ọ bụrụ na mmiri a akwụsịghị, olee otu nne m ga-esi chọta ụzọ ụlọ?”",
          "Mbe nọ n'okpuru osisi ahụ nụrụ olu ya. Mbe sịrị, “Nwa m, ebe a ka m nọ kemgbe ụtụtụ. Mmiri ozuzo adịghị egbu onye na-echere. Nọdụ ala, ka anyị chere ọnụ.”",
          "Ka anyanwụ na-ada, mmiri kwụsịrị. N'otu oge ahụ, nwa nnụnụ ahụ nụrụ ka nne ya na-akpọ aha ya site n'ofe ọhịa. Ọ fepụrụ n'ọṅụ, ma tupu ọ gaa, o lere Mbe anya wee sị, “Daalụ, nna m ochie.”",
          "Mbe chịrị ọchị. “Ekelela m,” ka o kwuru. “Cheta naanị na ndidi bụ ụzọ ụlọ.”",
        ),
      ],
    ],
  },
  {
    title: "Ihe Mere Okpokoro Mbe Ji Gbawaa",
    author: 1,
    type: "short",
    theme: "tortoise",
    synopsis: "Mbe gbaziri nku n'aka nnụnụ ka o soro ha gaa oriri n'eluigwe, ma o weere aha “Unu Niile”.",
    featured: true,
    reads: 2980,
    age: 6,
    chapters: [
      [
        "Ihe Mere Okpokoro Mbe Ji Gbawaa",
        p(
          "N'oge gara aga, a kpọrọ nnụnụ niile oriri n'eluigwe. Mbe nụrụ, agụụ agụọ ya. Ọ gakwuru nnụnụ wee rịọ ha, “Biko, nyenụ m otu nku otu nku, ka m soro unu.” Nnụnụ ọ bụla wepụtara otu nku nye ya.",
          "Ka ha na-efe, Mbe sịrị, “Mgbe a na-aga oriri, onye ọ bụla na-ewere aha ọhụrụ. Aha m bụ ‘Unu Niile’.” Nnụnụ ahụghị aghụghọ ọ zubere.",
          "Mgbe ha ruru, ndị eluigwe wetara nri wee sị, “Nke a bụ maka unu niile.” Mbe sịrị, “Unu anụla? Ọ bụ nke m. Aha m bụ Unu Niile!” O riri nri ahụ, nnụnụ fọdụrụ naanị ọkpụkpụ.",
          "Iwe were nnụnụ. Onye ọ bụla weghachiri nku ya, Mbe fọdụrụ naanị ya n'eluigwe. Ọ rịọrọ Okwere ka ọ gwa nwunye ya wepụta ihe dị nro n'ezi. Ma Okwere gwara ya ka o wepụta ihe siri ike — ọgụ, mma, na ite.",
          "Mbe sitere n'eluigwe daa. Ọ dakwasịrị ihe ndị ahụ, okpokoro ya gbawaa n'ọtụtụ ebe. Dibịa jikọtara ya ọzọ, ma akara ndị ahụ ka dị ruo taa. Ya mere, anyaukwu na-akpata ihe ọjọọ.",
        ),
      ],
    ],
  },
  {
    title: "Ihe Mere Igwe Ji Dị Elu",
    author: 2,
    type: "short",
    theme: "origins",
    synopsis: "Na mbụ, igwe dị nso nke na mmadụ nwere ike imetụ ya aka. Otu nwanyị na-asụ nri mere ka ọ gbaga elu.",
    featured: true,
    reads: 1875,
    age: 9,
    chapters: [
      [
        "Ihe Mere Igwe Ji Dị Elu",
        p(
          "Na mmalite ụwa, igwe dị nso n'ala. Ọ dị ka akwa ọcha a gbasaara n'elu ụlọ. Mgbe agụụ gụrụ ndị mmadụ, ha na-ebipụ obere igwe wee rie ya, n'ihi na ọ na-atọ ụtọ dịka ofe.",
          "Igwe gwara ha, “Biko, unu ebipụla karịa ihe unu ga-eri, unu ekpofukwala m n'ahịhịa.” Ndị mmadụ kwere, ma ọ dịghị onye chetara ya ogologo oge.",
          "Otu ụbọchị, otu nwanyị na-asụ ji n'ikwe. Ọ na-ebuli aka ya elu nke ukwuu, nke na aka odo ya kụrụ igwe ugboro ugboro. O bipụkwara igwe karịa ihe ọ ga-eri, wee tufuo nke fọdụrụ.",
          "Igwe were iwe, wee gbalaga elu, elu, ruo ebe ọ nọ taa. Kemgbe ụbọchị ahụ, mmadụ ga-akọ ubi ma rụọ ọrụ tupu o nwee nri. Ya mere, ndị okenye na-asị: echefula ihe e nyere gị n'efu.",
        ),
      ],
    ],
  },
  {
    title: "Ọkụkọ na Egbe",
    author: 1,
    type: "short",
    theme: "animals",
    synopsis: "Ọkụkọ gbaziri agụba n'aka Egbe ma tufuo ya. Ya mere Egbe ji na-ebu ụmụ ọkụkọ ruo taa.",
    reads: 1320,
    age: 12,
    chapters: [
      [
        "Ọkụkọ na Egbe",
        p(
          "Ọkụkọ na Egbe bụbu enyi. Otu ụbọchị, Ọkụkọ chọrọ ịkpụ isi ụmụ ya maka ememme, ma o nweghị agụba. Ọ gakwuru Egbe wee gbazite nke ya.",
          "Egbe sịrị, “Were ya, ma weghachite ya echi. Agụba a bụ ihe nketa nna m.” Ọkụkọ kwere nkwa.",
          "Mgbe Ọkụkọ kpụchara isi ụmụ ya, o tọgbọrọ agụba ahụ n'ala. Ka ọ na-akpa nri, o ji ụkwụ ya kpachaa ájá, agụba ahụ efuo n'ime ájá.",
          "Echi ya, Egbe bịara. Ọkụkọ kwara ákwá, na-akpa ájá ebe niile, ma ọ hụghị ya. Egbe sịrị, “Ebe ị tufuru ihe nketa m, m ga-ewere ihe nketa gị.” O buru otu nwa ọkụkọ fepụ.",
          "Ọ bụ ya mere ọkụkọ ji na-akpa ájá mgbe niile — ọ ka na-achọ agụba ahụ. Ọ bụkwa ya mere Egbe ji na-efe n'elu ogige, na-echere ụgwọ ya.",
        ),
      ],
    ],
  },
  {
    title: "Ojadili",
    author: 3,
    type: "long",
    theme: "heroes",
    synopsis: "Ojadili meriri onye ọ bụla n'ụwa, wee gaa ala mmụọ ịchọ onye ọzọ ọ ga-agba mgba. Ihe ọ chọtara n'ebe ahụ gbanwere ya.",
    featured: true,
    reads: 4105,
    age: 14,
    chapters: [
      [
        "Isi Mbụ: Dike nke Ụwa",
        p(
          "N'obodo Ojadili, ọ dịghị onye kwụrụ n'ihu ya n'ama mgba. Ọ gbara mgba n'obodo iri, meri ha niile. Ụmụ agbọghọ na-agụ abụ aha ya, ụmụaka na-eṅomi ka o si eje ije.",
          "Ma obi Ojadili adịghị ezu ike. “Ụwa a dị obere nye m,” ka o kwuru. “Ọ bụrụ na ọ dịghị onye ọzọ n'ụwa, aga m agba mgba na mmụọ.”",
          "Nna ya dọrọ ya aka ná ntị: “Onye kwuo ihe ọ ga-eme, chi ya ekwuo nke ya.” Ma Ojadili anụghị. O kwadoro ụgbụ ya, were ọgwụ dibịa, wee pụọ n'abalị.",
        ),
      ],
      [
        "Isi nke Abụọ: Ala Mmụọ",
        p(
          "Ojadili jere ije ụbọchị asaa ruo n'oke ala mmụọ. Mmụọ ndị nwere isi abụọ gbara mgba na ya — o meri ha. Mmụọ ndị nwere isi atọ, isi ise, isi asaa bịara — o meri ha niile.",
          "Ndị mmụọ tụrụ egwu. “Onye bụ mmadụ a?” ka ha jụrụ. Otu agadi mmụọ sịrị, “O nweghị onye nwere ike imeri ya — belụsọ chi ya.”",
          "Ojadili chịrị ọchị. “Kpọta ya!” ka o tiri mkpu. Ọ maghị na ọ na-akpọ onwe ya.",
        ),
      ],
      [
        "Isi nke Atọ: Mgba na Chi",
        p(
          "Otu mmụọ pụtara — onye dị nta, nke nwere naanị otu aka. O yighị ihe ọ bụla. Ojadili lere ya anya wee sị, “Nke a bụ onye m ga-agba mgba na ya?”",
          "Ha jidere onwe ha. N'otu ntabi anya, mmụọ ahụ buliri Ojadili elu, tụda ya n'ala. Ọ bụ chi ya.",
          "Ojadili biliri, ihere jupụtara ya n'ihu. Ọ laghachiri n'obodo ya, ma ọ dịghị mgbe ọ nyakwara isi ọzọ. Mgbe ụmụaka jụrụ ya ihe mere, ọ na-asị, “Onye ọ bụla nwere ike imeri mmadụ ibe ya. Ọ dịghị onye na-emeri chi ya.”",
        ),
      ],
    ],
  },
  {
    title: "Nwa Agbọghọ na Iyi Mmụọ",
    author: 2,
    type: "long",
    theme: "spirits",
    synopsis: "Adanna gara iyi dị n'ime ọhịa mmụọ ịchọ ite nne ya. Obi ọma ya bụ ihe chebere ya.",
    featured: true,
    reads: 2210,
    age: 21,
    chapters: [
      [
        "Isi Mbụ: Ite Furu Efu",
        p(
          "Adanna na nwanne ya nwanyị, Ụzọ, gara iyi ka ha kute mmiri. Ka ha na-alọta, Ụzọ kpọrọ ite nne ha ọsọ, ite ahụ dabaa n'iyi, mmiri ebuga ya.",
          "Nne ha were iwe. “Gaa chọta ya,” ka o kwuru. Ụzọ jụrụ. Adanna, onye nwere obi ọma, sịrị, “Aga m.” O sooro iyi ahụ banye n'ọhịa ebe ọ dịghị onye na-aga.",
        ),
      ],
      [
        "Isi nke Abụọ: Agadi Nwanyị",
        p(
          "N'ime ọhịa, Adanna hụrụ otu agadi nwanyị nọ n'akụkụ iyi. Ahụ ya juru n'ọnya. “Nwa m, saara m ahụ,” ka agadi ahụ kwuru. Adanna sara ya ahụ nwayọọ, n'atụghị egwu.",
          "Agadi nwanyị ahụ sịrị, “Ị ga-ahụ ite abụọ — otu dị mma, otu agbajiri agbaji. Were nke agbajiri agbaji.” Adanna mere dịka a gwara ya.",
          "Mgbe ọ lọtara, ite ahụ gbajiri agbaji jupụtara n'akụ, ọla na akwa mara mma. Ọṅụ juru ezinụlọ ha.",
        ),
      ],
      [
        "Isi nke Atọ: Ụzọ Gara",
        p(
          "Ụzọ hụrụ akụ ahụ, anyaukwu wee jide ya. O tufuru ite nke ya n'iyi, wee gaa n'ọhịa. Mgbe agadi nwanyị ahụ rịọrọ ya ka ọ saa ya ahụ, ọ sịrị, “Ahụ gị na-esi isi. Gaa saa onwe gị.”",
          "Ụzọ were ite kachasị mma. Mgbe ọ meghere ya n'ụlọ, agwọ na akpị si n'ime ya pụta. Ọ gbapụrụ ọsọ, na-ebe ákwá.",
          "Kemgbe ụbọchị ahụ, Ụzọ mụtara ihe. Ndị nne na-akọrọ ụmụ ha ifo a, na-asị: obi ọma bụ akụ a na-ahụghị anya.",
        ),
      ],
    ],
  },
  {
    title: "Egwu Nwa Ngwele",
    author: 0,
    type: "short",
    theme: "song",
    synopsis: "Ifo nwere egwu banyere nwa ngwele na-agụ abụ n'elu mgbidi.",
    draft: true,
    reads: 0,
    age: 0,
    chapters: [
      [
        "Egwu Nwa Ngwele",
        "Nwa ngwele rịgoro n'elu mgbidi, na-agụ: “Ngwele, ngwele, kwee isi — onye hụrụ nne m?” (Ọ ka na-aga n'ihu…)",
      ],
    ],
  },
];

const COMMENTS: [workTitle: string, who: "reader" | number, body: string][] = [
  ["Ihe Mere Okpokoro Mbe Ji Gbawaa", "reader", "Nne nne m na-akọ nke a mgbe anyị dị obere! “Unu Niile” — m ka na-achị ọchị. Daalụ maka idetu ya."],
  ["Ihe Mere Okpokoro Mbe Ji Gbawaa", 3, "In our village the parrot is the one who tells Tortoise's wife to bring out hard things. Same lesson though."],
  ["Ojadili", "reader", "Ọ dịghị onye na-emeri chi ya. This one stayed with me all day."],
  ["Ihe Mere Igwe Ji Dị Elu", 1, "I read this to my class today. They asked if the sky still tastes like ofe 😄"],
];

export async function seed() {
  const password = await hashPassword(DEMO_PASSWORD);
  // Better Auth keeps email + password logins in a "credential" account row whose accountId is the user's id.
  const withLogin = () => {
    const id = crypto.randomUUID();
    return { id, accounts: { create: { id: crypto.randomUUID(), accountId: id, providerId: "credential", password } } };
  };

  await prisma.$transaction(async (tx) => {
    // Users cascade to sessions, accounts, works, chapters, likes, comments and progress.
    await tx.donation.deleteMany();
    await tx.user.deleteMany();

    const authors = await Promise.all(
      AUTHORS.map((a, i) =>
        tx.user.create({
          data: {
            ...withLogin(),
            name: a.name,
            email: a.email,
            role: "author",
            bio: a.bio,
            avatarHue: a.hue,
            createdAt: daysAgo(120 - i * 10),
          },
        }),
      ),
    );

    const reader = await tx.user.create({
      data: {
        ...withLogin(),
        name: "Ada Reader",
        email: "reader@agumagu.test",
        role: "reader",
        avatarHue: 160,
        createdAt: daysAgo(40),
      },
    });

    const works: Work[] = [];
    for (const w of WORKS) {
      works.push(
        await tx.work.create({
          data: {
            slug: slugify(w.title),
            title: w.title,
            authorId: authors[w.author]!.id,
            type: w.type,
            theme: w.theme,
            synopsis: w.synopsis,
            status: w.draft ? "draft" : "published",
            featured: !!w.featured,
            reads: w.reads,
            createdAt: daysAgo(w.age),
            updatedAt: daysAgo(w.age),
            chapters: {
              create: w.chapters.map(([title, body], position) => ({ position, title, body, words: wordCount(body) })),
            },
          },
        }),
      );
    }

    const byTitle = (title: string) => works.find((w) => w.title === title)!;
    await tx.comment.createMany({
      data: COMMENTS.map(([title, who, body], i) => ({
        userId: who === "reader" ? reader.id : authors[who]!.id,
        workId: byTitle(title).id,
        body,
        createdAt: daysAgo(2 - i * 0.3),
      })),
    });

    // A few likes from the other storytellers so counts aren't all zero.
    await tx.like.createMany({
      data: works
        .filter((w) => w.status === "published")
        .flatMap((w) =>
          authors
            .filter((a) => a.id !== w.authorId)
            .slice(0, 1 + (w.reads % 3))
            .map((a) => ({ userId: a.id, workId: w.id, createdAt: daysAgo(1) })),
        ),
    });
    // Each query is a network round trip on a hosted database (Neon), so allow more than the 5s default.
  }, { timeout: 60_000 });
}

if (require.main === module) {
  (async () => {
    if (!process.argv.includes("--force") && (await prisma.user.count()) > 0) {
      console.log("Database already has data. Run with --force to reset it.");
    } else {
      await seed();
      console.log("Seed complete. Demo password:", DEMO_PASSWORD);
    }
    await prisma.$disconnect();
  })();
}
