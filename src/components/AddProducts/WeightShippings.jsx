import { ChevronDown } from "lucide-react";
import React from "react";

const WeightShippings = ({
  weightOptions = [],
  setWeightOptions,
  addWeightOption: addOption,
  updateWeightOption: updateOption,
  removeWeightOption: removeOption,
  units = [], // e.g. ["g","kg","piece"] or [{value,label}]
}) => {
  // normalize units into { value, label } objects
  const unitList = Array.isArray(units)
    ? units.map((u) => (typeof u === "string" ? { value: u, label: u } : u))
    : [];

  // Update a weight option
  const updateWeight = (_id, field, value) => {
    const newValue =
      ["weight", "price", "discountPrice", "stock"].includes(field)
        ? Number(value)
        : value;

    if (updateOption) updateOption(_id, field, newValue);
    else if (setWeightOptions)
      setWeightOptions((prev) =>
        prev.map((opt) => (_id === opt._id ? { ...opt, [field]: newValue } : opt))
      );
  };

  // Remove a weight option
  const removeWeight = (_id) => {
    if (removeOption) removeOption(_id);
    else if (setWeightOptions)
      setWeightOptions((prev) => prev.filter((opt) => opt._id !== _id));
  };

  // Add a new weight option — unit left empty so user must pick a unit
  const addWeight = () => {
    if (addOption) addOption();
    else if (setWeightOptions)
      setWeightOptions((prev) => [
        ...prev,
        {
          _id: Date.now().toString(), // temporary ID for frontend
          weight: 0,
          unit: "", // intentionally empty so no default is shown
          price: 0,
          discountPrice: 0,
          stock: 0,
        },
      ]);
  };

  return (
    <div className="p-5 mt-8 relative border rounded-xl bg-white mx-5">
      <h2 className="text-base font-medium border-b pb-5 flex items-center">
        <ChevronDown className="mr-2 size-4" /> Weight Options
      </h2>

      <div className="mt-5 space-y-3">
        {weightOptions.map((opt) => (
          <div key={opt._id} className="flex gap-3 items-center">
            {/* Weight */}
            <input
              type="number"
              placeholder="Weight"
              value={opt.weight}
              onChange={(e) => updateWeight(opt._id, "weight", e.target.value)}
              className="h-10 rounded-md border px-3 w-1/6"
            />

            {/* Unit */}
            <select
              value={opt.unit || ""}
              onChange={(e) => updateWeight(opt._id, "unit", e.target.value)}
              className="h-10 rounded-md border px-3 w-1/6"
            >
              <option value="">Select unit</option>
              {unitList.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>

            {/* Selling Price */}
            <input
              type="number"
              placeholder="Selling Price"
              value={opt.price}
              onChange={(e) => updateWeight(opt._id, "price", e.target.value)}
              className="h-10 rounded-md border px-3 w-1/6"
            />

            {/* Actual Price */}
            <input
              type="number"
              placeholder="Actual Price"
              value={opt.discountPrice || 0}
              onChange={(e) =>
                updateWeight(opt._id, "discountPrice", e.target.value)
              }
              className="h-10 rounded-md border px-3 w-1/6"
            />

            {/* Stock */}
            <input
              type="number"
              placeholder="Stock"
              value={opt.stock}
              onChange={(e) => updateWeight(opt._id, "stock", e.target.value)}
              className="h-10 rounded-md border px-3 w-1/6"
            />

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => removeWeight(opt._id)}
              className="px-3 py-2 bg-red-500 text-white rounded-md"
            >
              Remove
            </button>
          </div>
        ))}

        {/* Add Button */}
        <button
          type="button"
          onClick={addWeight}
          className="mt-2 px-4 py-2 bg-indigo-500 text-white rounded-md"
        >
          Add Weight Option
        </button>
      </div>
    </div>
  );
};

export default WeightShippings;
