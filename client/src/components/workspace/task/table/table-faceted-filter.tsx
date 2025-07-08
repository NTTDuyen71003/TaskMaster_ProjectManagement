/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { Check, X, Filter, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslation } from "react-i18next";

interface DataTableFacetedFilterProps {
  title?: string;
  options: {
    label: string | JSX.Element;
    value: string;
    icon?: React.ComponentType<{ className?: string }> | any;
  }[];
  disabled?: boolean;
  multiSelect?: boolean;
  selectedValues: string[];
  onFilterChange: (values: string[]) => void;
}

export function DataTableFacetedFilter({
  title,
  options,
  selectedValues = [],
  disabled,
  multiSelect = true,
  onFilterChange,
}: DataTableFacetedFilterProps) {
  const selectedValueSet = new Set(selectedValues);
  const [open, setOpen] = React.useState(false);
  const { t } = useTranslation();

  const onClose = () => {
    setOpen(false);
  };

  const clearAllFilters = () => {
    onFilterChange([]);
  };


  return (
    <Popover modal={true} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant={selectedValueSet.size > 0 ? "status" : "outline"}
          size="sm"
          className={cn(
            "h-9 border-sidebar-border transition-all duration-200 hover:border-solid",
            "min-w-[120px] justify-between font-medium",
            selectedValueSet.size > 0 && "border border-sidebar-border"
          )}
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm">{title}</span>
          </div>

          {selectedValueSet.size > 0 ? (
            <div className="flex items-center gap-1 ml-2">
              <Badge
                variant="create"
                className="h-5 px-2 text-xs font-medium"
              >
                {selectedValueSet.size}
              </Badge>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </div>
          ) : (
            <ChevronDown className="h-4 w-4 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>

      {/*dropdown datas */}
      <PopoverContent className="w-[280px] p-0 bg-sidebar" align="start">
        <Command>
          {/* Search input */}
          <CommandInput
            placeholder={`${t("taskboard-search-all")} ${title?.toLowerCase()}...`}
            className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
          <CommandEmpty className="px-4 py-3 text-sm text-muted text-center">
            {t("taskboard-search-data-result-notfound")}
          </CommandEmpty>

          <CommandList className="max-h-64">
            <CommandGroup className="p-2">
              {options.map((option) => {
                const isSelected = selectedValueSet.has(option.value);
                return (
                  <CommandItem
                    className={cn(
                      "cursor-pointer rounded-md px-3 py-2.5 text-sm transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus:bg-sidebar focus:text-accent-foreground",
                      isSelected && "bg-dropdown-hover-bg"
                    )}
                    key={option.value}
                    onSelect={() => {
                      if (multiSelect) {
                        const updatedValues = isSelected
                          ? selectedValues.filter((val) => val !== option.value)
                          : [...selectedValues, option.value];
                        onFilterChange(updatedValues);
                      } else {
                        onFilterChange(isSelected ? [] : [option.value]);
                        onClose();
                      }
                    }}
                  >
                    {/* This function generates the dropdown columns for the task table. */}
                    <div className="flex items-center space-x-3 w-full">
                      <span className="flex-1 truncate">{option.label}</span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-sidebar-text" />
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>

            {/* Clear all filters button */}
            {selectedValueSet.size > 0 && (
              <>
                <CommandSeparator className="my-1" />
                <CommandItem
                  onSelect={clearAllFilters}
                  className="cursor-pointer justify-center text-center py-2.5 text-sm font-medium text-muted hover:text-foreground transition-colors rounded-md hover:bg-muted/50 group"
                >
                  <X className="mr-2 h-4 w-4 group-hover:text-black dark:group-hover:text-white transition-colors" />
                  <span className="group-hover:text-black dark:group-hover:text-white transition-colors">{t("taskboard-clear-allfilter")}</span>
                </CommandItem>
              </>
            )}

          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}