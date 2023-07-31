import { useEffect } from "react";

export const usePageTitle = (title) => {
  useEffect(() => {
    if (title) document.title = `Natours | ${title}`;

    return () =>
      (document.title = "Natours | Exciting tours for adventurous people");
  }, [title]);
};
