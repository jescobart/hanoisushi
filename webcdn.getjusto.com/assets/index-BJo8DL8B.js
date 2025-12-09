import{r as l,j as t}from"./jsx-runtime-BGxL3LVy.js";import{u as v}from"./uniqueId-DlOYuaFD.js";import{c as o}from"./utils-mMyIM9tf.js";import{B as k}from"./index-cWEE_j1p.js";import{c as m}from"./createLucideIcon-gj9TAl09.js";/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=m("SquareCheck",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=m("Square",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}]]);function w(e){var c;const{inverse:s}=e,u=l.useRef(`checkbox-${e.fieldName}-${v()}`).current,i=s?!e.value:e.value,[h,a]=l.useState(!1),r=async d=>{a(!0);try{await e.onChange(s?!d:d)}catch(f){console.error(f)}a(!1)},x=e.disabled||h,n=!!((c=e.errorMessage)!=null&&c.trim());return t.jsxs("div",{children:[t.jsxs("div",{className:o("relative flex",e.className),children:[t.jsx(k,{type:"button",disabled:x,onClick:()=>r(!i),variant:"link",size:"auto",children:i?t.jsx(j,{strokeWidth:2,className:"w-5 h-5 text-primary"}):t.jsx(g,{strokeWidth:1.2,className:"h-5 w-5 text-muted-foreground"})}),e.label||e.description?t.jsxs("div",{className:"ml-3 text-sm",children:[t.jsx("div",{onClick:()=>r(!i),className:"font-medium",children:e.label}),e.description&&t.jsx("div",{id:`${u}-description`,className:"",children:e.description})]}):null]}),e.errorMessage!==void 0?t.jsx("p",{className:o("text-sm min-h-5 mt-1",n?"text-destructive":"invisible"),children:n?e.errorMessage:" "}):null]})}export{w as C};
