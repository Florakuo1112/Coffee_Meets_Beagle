import { Link } from "@tanstack/react-router";
import { Frown } from "lucide-react";

function Error404() {
  return (
    <div className="flex h-[calc(100vh-75px)] w-full items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <div
          className="mb-3 flex items-center justify-center text-[50px] font-extrabold text-[#333]"
          id="title"
        >
          4
          <Frown className="mx-1 h-[50px] w-[50px]" />
          4
        </div>

        <div className="desc">
          <p className="text-textFontSizes mb-6 text-[#333]">
            抱歉， 我們找不到符合您搜尋條件的頁面。在此期間您可以：
          </p>
        </div>
        <div className="bg-primary-burnt-orange mt-3 inline-block cursor-pointer rounded-[1vh] px-3 text-textFontSizes transition-all duration-300">
          <Link
            to="/"
            className="block h-full p-3 font-bold text-white no-underline"
          >
            返回首頁
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Error404;
