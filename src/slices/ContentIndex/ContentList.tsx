"use client";

import { Content, asImageSrc, isFilled } from "@prismicio/client";
import React, { useEffect, useRef, useState } from "react";
import { MdArrowOutward } from "react-icons/md";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type ContentListProps = {
  items: Content.BlogPostDocument[] | Content.ProjectDocument[];
  contentType: Content.ContentIndexSlice["primary"]["content_type"];
  fallbackItemImage: Content.ContentIndexSlice["primary"]["fallback_item_image"];
  viewMoreText: Content.ContentIndexSlice["primary"]["view_more_text"];
};

export default function ContentList({
  items,
  contentType,
  fallbackItemImage,
  viewMoreText = "Read More",
}: ContentListProps) {
  const component = useRef(null);
  const itemsRef = useRef<Array<HTMLLIElement | null>>([]);
  const revealRef = useRef(null);
  const [currentItem, setCurrentItem] = useState<null | number>(null);

  const lastMousePos = useRef({ x: 0, y: 0 });

  const uriPrefix = contentType == "Blog" ? "/blog" : "/project";

  useEffect(() => {
    let ctx = gsap.context(() => {
      itemsRef.current.forEach((item) => {
        gsap.fromTo(
          item,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 1.3,
            ease: "eastic.out(1,0.3)",
            scrollTrigger: {
              trigger: item,
              start: "top bottom-=100px",
              end: "bottom center",
              toggleActions: "play none none none",
            },
          },
        );
      });
      return () => ctx.revert();
    }, component);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const mousePos = { x: e.clientX, y: e.clientY + window.scrollY };

      //calculate speed and direction
      const speed = Math.sqrt(Math.pow(mousePos.x - lastMousePos.current.x, 2));

      let ctx = gsap.context(() => {
        if (currentItem !== null) {
          const maxY = window.scrollY + window.innerHeight - 350;
          const maxX = window.innerWidth + 250;

          gsap.to(revealRef.current, {
            x: gsap.utils.clamp(0, maxX, mousePos.x - 110),
            y: gsap.utils.clamp(0, maxY, mousePos.y - 160),
            rotation: speed * (mousePos.x > lastMousePos.current.x ? 1 : -1),
            ease: "back.out(2)",
            duration: 1.3,
          });
        }
        lastMousePos.current = mousePos;
        // Return cleanup function
        return () => ctx.revert(); // This return is to define the cleanup function
      }, component);
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [currentItem]);

  const contentImages = items.map((item) => {
    const image = isFilled.image(item.data.hover_image)
      ? item.data.hover_image
      : fallbackItemImage;
    return asImageSrc(image, {
      fit: "crop",
      w: 220,
      h: 320,
      exp: -10,
    });
  });

  // // Preload images
  useEffect(() => {
    contentImages.forEach((url) => {
      if (!url) return;
      const img = new Image();
      img.src = url;
    });
  }, [contentImages]);

  const onMouseEnter = (index: number) => {
    setCurrentItem(index);
  };

  const onMouseLeave = () => {
    setCurrentItem(null);
  };

  return (
    <>
      <ul
        ref={component}
        className="grid border-b border-b-slate-100"
        onMouseLeave={onMouseLeave}
      >
        {items.map((post, index) => (
          // <li
          //   key={index}
          //   ref={(el) => (itemsRef.current[index] = el)}
          //   onMouseEnter={() => onMouseEnter(index)}
          //   className="list-item opacity-0"
          // >
          <li
            key={index}
            ref={(el) => {
              // Ensure itemRef array has enough elements
              if (itemsRef.current.length <= index) {
                itemsRef.current.push(el);
              } else {
                itemsRef.current[index] = el;
              }
            }}
            onMouseEnter={() => onMouseEnter(index)}
            className="list-item opacity-0f"
          >
            <a
              href={`${uriPrefix}/${post.uid}`}
              className="flex flex-col justify-between border-t border-t-slate-100 py-10  text-slate-200 md:flex-row "
              aria-label={post.data.title || ""}
            >
              <div className="flex flex-col">
                <span className="text-3xl font-bold">{post.data.title}</span>
                <div className="flex gap-3 text-yellow-400">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="text-lg font-bold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <span className="ml-auto flex items-center gap-2 text-xl font-medium md:ml-0">
                {viewMoreText} <MdArrowOutward />
              </span>
            </a>
          </li>
        ))}

        {/* Hover element */}
        <div
          className="hover-reveal pointer-events-none absolute left-0 top-0 -z-10 h-[320px] w-[220px] rounded-lg bg-cover bg-center opacity-0f transition-[background] duration-300"
          style={{
            backgroundImage:
              currentItem !== null ? `url(${contentImages[currentItem]})` : "",
          }}
          ref={revealRef}
        ></div>
      </ul>
    </>
  );
}
