import "./style.css";

const main = document.querySelector("main")!;

window.addEventListener("beforeprint", () => {
  main.setAttribute(
    "style",
    `
    margin: 0;
    border-radius: 0;
    box-shadow: none;
  `
  );
});

window.addEventListener("afterprint", () => {
  main.removeAttribute("style");
});
