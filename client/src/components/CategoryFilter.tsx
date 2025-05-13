import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: readonly string[];
  selectedCategory: string;
  onChange: (category: string | null) => void;
}

const CategoryFilter = ({ categories, selectedCategory, onChange }: CategoryFilterProps) => {
  const handleCategoryClick = (category: string) => {
    if (category === 'Tous' || category === 'Toutes') {
      onChange(null);
    } else {
      onChange(category);
    }
  };

  return (
    <div className="flex mb-8 overflow-x-auto scrollbar-hide space-x-4">
      {categories.map((category) => (
        <Button
          key={category}
          variant="outline"
          className={cn(
            "px-4 py-2 rounded-md",
            selectedCategory === category
              ? "bg-primary text-white"
              : "bg-lightgray text-gray-300 hover:bg-lightgray/80"
          )}
          onClick={() => handleCategoryClick(category)}
        >
          {category}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
