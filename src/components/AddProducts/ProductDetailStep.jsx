import { ChevronDown, Paperclip, Plus } from "lucide-react";

const ProductDetailStep = ({
  description,
  setDescription,
  cutType,
  setCutType,
  shelfLife,
  setShelfLife,
  storageInstructions,
  setStorageInstructions,
  certifications,
  addCertification,
  removeCertification,
  videoUrl,
  setVideoUrl,
  onAddVideoClick,
}) => {
  console.log(description);
  
  return (
    <div className="relative p-5 mt-8">
      <div className="before:absolute before:inset-0 before:mx-3 before:-mb-3 before:border before:border-foreground/10 before:bg-background/30 before:shadow-md before:z-[-1] before:rounded-xl after:absolute after:inset-0 after:border after:border-foreground/10 after:bg-background after:shadow-md after:rounded-xl after:z-[-1] after:backdrop-blur-md" />
      <div className="rounded-lg border p-5 relative z-10 bg-white">
        <div className="flex items-center border-b pb-5 text-base font-medium">
          <ChevronDown className="mr-2 size-4 stroke-[1.5]" />
          Product Detail
        </div>

        <div className="mt-5 flex flex-col gap-5">
          {/* Condition
          <div className="flex flex-col xl:flex-row items-start">
            <div className="w-full xl:w-64 xl:mr-10">
              <div className="font-medium">Condition</div>
            </div>
            <div className="mt-3 xl:mt-0 flex-1 w-full">
              <div className="grid grid-cols-2 gap-4 w-40">
                {["new", "used"].map((val) => (
                  <label key={val} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="condition"
                      value={val}
                      checked={condition === val}
                      onChange={(e) => setCondition(e.target.value)}
                      className="peer hidden"
                    />
                    <div className="relative size-4 rounded-full border border-gray-400 bg-white flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-gray-800 peer-checked:block hidden" />
                    </div>
                    <span className="font-medium capitalize">{val}</span>
                  </label>
                ))}
              </div>
            </div>
          </div> */}

          {/* Product Description */}
          <div className="flex flex-col xl:flex-row items-start">
            <div className="w-full xl:w-64 xl:mr-10">
              <div className="font-medium">Product Description</div>
              <div className="mt-3 text-xs opacity-70 leading-relaxed">
                <p>
                  Make sure the product description provides a detailed explanation of your product so that it is easy to understand and find.
                </p>
                <p className="mt-2">
                  Do not include mobile numbers, emails, etc., to protect your personal data.
                </p>
              </div>
            </div>
            <div className="mt-3 xl:mt-0 flex-1 w-full">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Describe your product..."
                className="w-full rounded-md border px-3 py-2 bg-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <p className="text-right text-xs text-gray-500 mt-1">
                {description?.length}/2000
              </p>
            </div>
          </div>

                    {/* Cut Type */}
                    <div className="flex flex-col xl:flex-row items-start">
            <div className="w-full xl:w-64 xl:mr-10">
              <div className="font-medium">Cut Type</div>
            </div>
            <div className="mt-3 xl:mt-0 flex-1 w-full">
              <input
                type="text"
                value={cutType}
                onChange={(e) => setCutType(e.target.value)}
                placeholder="e.g., Boneless, Whole, Sliced"
                className="w-full rounded-md border px-3 py-2 bg-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

                    {/* Shelf Life */}
                    <div className="flex flex-col xl:flex-row items-start">
            <div className="w-full xl:w-64 xl:mr-10">
              <div className="font-medium">Shelf Life</div>
            </div>
            <div className="mt-3 xl:mt-0 flex-1 w-full">
              <input
                type="text"
                value={shelfLife}
                onChange={(e) => setShelfLife(e.target.value)}
                placeholder="e.g., 3 days refrigerated"
                className="w-full rounded-md border px-3 py-2 bg-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

                    {/* Storage Instructions */}
                    <div className="flex flex-col xl:flex-row items-start">
            <div className="w-full xl:w-64 xl:mr-10">
              <div className="font-medium">Storage Instructions</div>
            </div>
            <div className="mt-3 xl:mt-0 flex-1 w-full">
              <textarea
                value={storageInstructions}
                onChange={(e) => setStorageInstructions(e.target.value)}
                rows={3}
                placeholder="e.g., Keep refrigerated at 0-4°C"
                className="w-full rounded-md border px-3 py-2 bg-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

                    {/* Certifications */}
                    <div className="flex flex-col xl:flex-row items-start">
            <div className="w-full xl:w-64 xl:mr-10">
              <div className="font-medium">Certifications</div>
            </div>
            <div className="mt-3 xl:mt-0 flex-1 w-full">
              <div className="flex flex-wrap gap-2">
                {certifications?.map((cert, idx) => (
                  <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md">
                    <span>{cert}</span>
                    <button
                      type="button"
                      onClick={() => removeCertification(cert)}
                      className="text-red-500 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const cert = prompt("Enter certification name:");
                    if (cert) addCertification(cert);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50"
                >
                  <Plus className="size-4" /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Product Video */}
          <div className="flex flex-col xl:flex-row items-start">
            <div className="w-full xl:w-64 xl:mr-10">
              <div className="font-medium">Product Video</div>
              <p className="mt-3 text-xs opacity-70 leading-relaxed">
                Add a video so that buyers are more interested in your product.{" "}
                <a
                  href="https://design4users.com/wp-content/uploads/2021/03/beauty-commerce-webdesign.png"
                  target="_blank"
                  className="text-indigo-600 font-medium"
                  rel="noreferrer"
                >
                  Learn more.
                </a>
              </p>
            </div>
            <div className="mt-3 xl:mt-0 flex-1 w-full">
              <input type="url" placeholder="Add Video URL(Youtube)" className="w-full rounded-md border px-3 py-2 bg-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"/>
              <button
                type="button"
                onClick={onAddVideoClick}
                className="inline-flex items-center mt-2 gap-2 h-10 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50"
              >
                <Paperclip className="size-4" />
                Upload Video
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailStep;
