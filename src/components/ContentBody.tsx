

import { SliceZone } from "@prismicio/react";


import { components } from "@/slices";
import Bounded from "@/components/Bounded";
import Heading from "@/components/Heading";
import { Content, DateField, isFilled } from "@prismicio/client";

type Params = { uid: string };

export default async function ContentBody({page}:{
    page: Content.BlogPostDocument | Content.ProjectDocument;
}) {
  function formatDate(date: DateField) {
    if (isFilled.date(date)) {
      // const date = new Date(page.data.date);
      const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return new Intl.DateTimeFormat("en-US", dateOptions).format(
        new Date(date)
      );
    }
  }

  const formattedDate = formatDate(page.data.date);

  return (
    <Bounded as="article">
      <div className="runded-2xl border-2 border-slate-800 bg-slate-900 px-4 py-10 md:px-8 md:py-20">
        <Heading as="h1">{page.data.title}</Heading>
        <div className="flex gap-4 text-yellow-400 text-xl fotn-bold py-5">
          {page.tags.map((tag, index) => (
            <span key={index}>{tag}</span>
          ))}
        </div>
        <p className="mt-8 border-b border-slate-600 text-xl font-medium text-slate-300 pb-5">{formattedDate}</p>
        <div className="prose prose-lg prose-invert mt-12 w-full max-w-none md:mt-20">
        <SliceZone slices={page.data.slices} components={components} />
        </div>
      </div>
    </Bounded>
  );
}

