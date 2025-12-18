// // src/modules/products/components/product-content.tsx
// import React from "react"

// type ContentBlock =
//   | { type: "h1"; text: string }
//   | { type: "h2"; text: string }
//   | { type: "h3"; text: string }
//   | { type: "paragraph"; text: string }
//   | { type: "paragraph_bold"; text: string }
//   | { type: "note"; text: string }
//   | { type: "list"; items: string[] }
//   | {
//       type: "table"
//       rows: [string, string][]
//     }
//   | {
//       type: "video_links"
//       items: { url: string; label: string }[]
//     }
//   | { type: string; [k: string]: any }

// type ProductContentProps = {
//   blocks: ContentBlock[] | null | undefined
// }

// const ProductContent: React.FC<ProductContentProps> = ({ blocks }) => {
//   if (!blocks || !blocks.length) {
//     return null
//   }

//   return (
//     <article className="prose max-w-none prose-headings:scroll-m-20 prose-p:leading-relaxed prose-ul:list-disc prose-ul:pl-5 prose-li:my-1 prose-table:w-full prose-table:text-sm">
//       {blocks.map((block, idx) => {
//         switch (block.type) {
//           case "h1":
//             return (
//               <h1 key={idx} className="text-3xl font-semibold tracking-tight">
//                 {block.text}
//               </h1>
//             )
//           case "h2":
//             return (
//               <h2 key={idx} className="text-2xl font-semibold mt-8 mb-3">
//                 {block.text}
//               </h2>
//             )
//           case "h3":
//             return (
//               <h3 key={idx} className="text-xl font-semibold mt-6 mb-2">
//                 {block.text}
//               </h3>
//             )
//           case "paragraph":
//             return (
//               <p key={idx} className="text-base leading-relaxed">
//                 {block.text}
//               </p>
//             )
//           case "paragraph_bold":
//             return (
//               <p key={idx} className="font-semibold">
//                 {block.text}
//               </p>
//             )
//           case "note":
//             return (
//               <div
//                 key={idx}
//                 className="border-l-4 border-amber-400 bg-amber-50 text-amber-900 px-4 py-3 text-sm rounded-md"
//               >
//                 {block.text}
//               </div>
//             )
//           case "list":
//             return (
//               <ul key={idx} className="list-disc pl-5 space-y-1">
//                 {block.items?.map((item, i) => (
//                   <li key={i}>{item}</li>
//                 ))}
//               </ul>
//             )
//           case "table":
//             return (
//               <div key={idx} className="overflow-x-auto">
//                 <table className="w-full border-collapse text-sm">
//                   <tbody>
//                     {block.rows?.map(([label, value], i) => (
//                       <tr
//                         key={i}
//                         className={i % 2 === 0 ? "bg-muted/40" : "bg-background"}
//                       >
//                         <td className="border px-3 py-2 font-medium align-top w-1/3">
//                           {label}
//                         </td>
//                         <td className="border px-3 py-2 align-top">{value}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )
//           case "video_links":
//             return (
//               <div key={idx} className="flex flex-wrap gap-3 my-4">
//                 {block.items?.map((item, i) => (
//                   <a
//                     key={i}
//                     href={item.url}
//                     target="_blank"
//                     rel="noreferrer"
//                     className="inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-medium hover:bg-accent transition"
//                   >
//                     {item.label}
//                   </a>
//                 ))}
//               </div>
//             )
//           default:
//             // На всяк випадок, щоб не падати від несподіваного типу
//             return null
//         }
//       })}
//     </article>
//   )
// }

// export default ProductContent
