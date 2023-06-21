import React from "react";
import UseCollect from "../components/UseCollect";
import { SparklesIcon } from "@heroicons/react/24/outline";

const CollectSavePoint = () => (
  <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs mt-6 rounded-3xl">
    <SparklesIcon className="h-8 w-8 fill-secondary" />
    <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
      Collect SavePoint: <br />
      <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
        <UseCollect />
      </div>
    </div>
  </div>
);

export default CollectSavePoint;
