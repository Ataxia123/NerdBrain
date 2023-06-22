import React from "react";
import UseCollectedPublications from "../components/UseCollectedPublications";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const PublicationComponent = () => (
  <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center mt-6 max-w-xs overflow-auto rounded-3xl">
    <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
    <UseCollectedPublications />
  </div>
);

export default PublicationComponent;
