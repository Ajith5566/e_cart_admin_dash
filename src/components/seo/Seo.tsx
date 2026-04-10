// components/SeoPreview.tsx
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import type { MetaFields } from "../../types/types";
import "./seo.css";

type SeoPreviewProps = {
  value: MetaFields;
  onChange: (updated: MetaFields) => void;
  baseUrl?: string;
};

function SeoPreview({ value, onChange, baseUrl = "https://yourdomain.com/" }: SeoPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handle =
    (field: keyof MetaFields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange({ ...value, [field]: e.target.value });

  const previewUrl   = `${baseUrl}${value.slug || ""}`;
  const previewTitle = value.meta_title || "Page Title";
  const previewDesc  = value.meta_description || "Meta description here.";
   // ✅ define state types
  const [keywords, setKeywords] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");

  // ✅ type the keyboard event
  const handleKeyDown = (
  e: React.KeyboardEvent<HTMLInputElement>
) => {
  if (e.key === "Enter" || e.key === ",") {
    e.preventDefault();

    const val = input.trim();

    if (val && !keywords.includes(val)) {
      const updated = [...keywords, val];

      setKeywords(updated);

      // ✅ update meta
      onChange({
        ...value,
        meta_keywords: updated,
      });
    }

    setInput("");
  }
};

  const removeKeyword = (index: number) => {
  const updated = keywords.filter(
    (_, i) => i !== index
  );

  setKeywords(updated);

  // ✅ update meta
  onChange({
    ...value,
    meta_keywords: updated,
  });
};


  return (
    <div className="seo-preview-wrapper h-auto">

      {/* ── SEO Preview Card ── */}
      <div className="seo-preview-card">
        <div className="seo-preview-content">
          <p className="seo-preview-title">{previewTitle}</p>
          <p className="seo-preview-url">{previewUrl}</p>
          <p className="seo-preview-desc">{previewDesc}</p>
        </div>
        <button
          type="button"
          className="seo-edit-btn"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "Close" : "Edit"}
          <FontAwesomeIcon
            icon={isOpen ? faChevronUp : faChevronDown}
            className="ms-2"
            style={{ fontSize: 12 }}
          />
        </button>
      </div>

      {/* ── Animated Dropdown ── */}
      <div className={`seo-fields-dropdown ${isOpen ? "seo-fields-open" : ""}`}>
        <div className="seo-fields-inner">

          {/* ── Row 1: Meta + OG ── */}
          <div className="seo-fields-grid">

            {/* Left — Meta fields */}
            <div className="seo-col">
              <p className="seo-section-title">Meta</p>

              <div className="seo-field-group">
                <label className="seo-label">
                  Slug
                  <span className="seo-info" title="Unique URL-friendly identifier for the page. Use lowercase letters, numbers, and hyphens.">ℹ</span>
                </label>
                <input
                  className="seo-input"
                  value={value.slug ?? ""}
                  onChange={handle("slug")}
                />
              </div>

              <div className="seo-field-group">
                <label className="seo-label">
                  Meta Title
                  <span className="seo-info" title="Shown in browser tab and search results">ℹ</span>
                </label>
                <input
                  className="seo-input"
                  placeholder="Enter meta title"
                  value={value.meta_title ?? ""}
                  onChange={handle("meta_title")}
                />
              </div>

              <div className="seo-field-group">
                <label className="seo-label">
                  Meta Keywords
                  <span className="seo-info" title="Comma-separated keywords">ℹ</span>
                </label>
                <div className="tag-input">
        {keywords.map((word, index) => (
          <span key={index} className="tag">
            {word}
            <button 
            type="button"
            onClick={() => removeKeyword(index)}>
              ×
            </button>
          </span>
        ))}

        <input
          className="seo-input"
          placeholder="Enter meta keywords"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

                <small className="seo-hint">Enter meta keywords, separated by commas</small>
              </div>

              <div className="seo-field-group">
                <label className="seo-label">
                  Meta Description
                  <span className="seo-info" title="Shown in search result snippets">ℹ</span>
                </label>
                <textarea
                  className="seo-textarea"
                  placeholder="Enter meta description"
                  value={value.meta_description ?? ""}
                  onChange={handle("meta_description")}
                />
              </div>

              <div className="seo-field-group">
                <label className="seo-label">
                  Canonical URL
                  <span className="seo-info" title="Preferred URL for this page">ℹ</span>
                </label>
                <input
                  className="seo-input"
                  placeholder="Enter canonical URL"
                  value={value.canonical_url ?? ""}
                  onChange={handle("canonical_url")}
                />
              </div>
            </div>

            {/* Right — Open Graph */}
            <div className="seo-col">
              <p className="seo-section-title">Open Graph Metadata</p>

              <div className="seo-field-group">
                <label className="seo-label">
                  OG Title
                  <span className="seo-info" title="Title shown when shared on social media">ℹ</span>
                </label>
                <input
                  className="seo-input"
                  placeholder="Enter Open Graph title"
                  value={value.og_title ?? ""}
                  onChange={handle("og_title")}
                />
              </div>

              <div className="seo-field-group">
                <label className="seo-label">
                  OG Description
                  <span className="seo-info" title="Description shown when shared on social media">ℹ</span>
                </label>
                <textarea
                  className="seo-textarea"
                  placeholder="Enter Open Graph description"
                  value={value.og_description ?? ""}
                  onChange={handle("og_description")}
                />
              </div>

              <div className="seo-field-group">
                <label className="seo-label">
                  OG Image
                  <span className="seo-info" title="Image shown when shared on social media">ℹ</span>
                </label>
                {value.og_image && typeof value.og_image === "string" && (
                  <img src={value.og_image} alt="OG preview" className="seo-og-preview" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="seo-file-input"
                  onChange={(e) => onChange({ ...value, og_image: e.target.files?.[0] ?? null })}
                />
              </div>
            </div>
          </div>

          {/* ── Row 2: Twitter + Schema ── */}
          <div className="seo-fields-grid seo-fields-grid--top-border">

            {/* Left — Twitter */}
            <div className="seo-col">
              <p className="seo-section-title">Twitter Metadata</p>

              <div className="seo-field-group">
                <label className="seo-label">
                  Twitter Title
                  <span className="seo-info" title="Title shown when shared on Twitter">ℹ</span>
                </label>
                <input
                  className="seo-input"
                  placeholder="Enter Twitter title"
                  value={value.twitter_title ?? ""}   
                  onChange={handle("twitter_title")}
                />
              </div>

              <div className="seo-field-group">
                <label className="seo-label">
                  Twitter Description
                  <span className="seo-info" title="Description shown when shared on Twitter">ℹ</span>
                </label>
                <textarea
                  className="seo-textarea"
                  placeholder="Enter Twitter description"
                  value={value.twitter_description ?? ""}  
                  onChange={handle("twitter_description")}
                />
              </div>

              <div className="seo-field-group">
                <label className="seo-label">
                  Twitter Image
                  <span className="seo-info" title="Image shown when shared on Twitter">ℹ</span>
                </label>
                {value.twitter_image && typeof value.twitter_image === "string" && (
                  <img src={value.twitter_image} alt="Twitter preview" className="seo-og-preview" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="seo-file-input"
                  onChange={(e) =>
                    onChange({ ...value, twitter_image: e.target.files?.[0] ?? null }) // ✅ fixed — was og_image
                  }
                />
              </div>
            </div>

            {/* Right — Schema Markup */}
            <div className="seo-col">
              <p className="seo-section-title">Schema Markup</p>

              <div className="seo-field-group">
                <label className="seo-label">
                  Schema Markup
                  <span className="seo-info" title="Structured data for search engines">ℹ</span>
                </label>
                <textarea
                  className="seo-textarea seo-textarea--tall"
                  placeholder="Enter JSON-LD or other schema markup"
                  value={value.schema_markup ?? ""}  
                  onChange={handle("schema_markup")}
                  rows={10}
                />
                <small className="seo-hint">
                  Add schema content without the{" "}
                  <code>&lt;script type="application/ld+json"&gt;</code> tag.
                  For multiple schemas use{" "}
                  <code>[{"{...}"}, {"{...}"}]</code>, for a single schema use{" "}
                  <code>{"{...}"}</code>.
                </small>
              </div>
            </div>
          </div>

          {/* ── Row 3: Robots + Sitemap ── */}
          <div className="seo-bottom-section w-50 ">

            <div className="seo-checkbox-group">
              <label className="seo-checkbox-label">
                <input
                  type="checkbox"
                  checked={value.allow_indexing ?? true}   
                  onChange={(e) => onChange({ ...value, allow_indexing: e.target.checked })}
                />
                Allow search engines to index this page
                <span className="seo-info" title="Adds 'index' to the robots meta tag">ℹ</span>
              </label>

              <label className="seo-checkbox-label">
                <input
                  type="checkbox"
                  checked={value.allow_following ?? true}  
                  onChange={(e) => onChange({ ...value, allow_following: e.target.checked })}
                />
                Allow search engines to follow links on this page
                <span className="seo-info" title="Adds 'follow' to the robots meta tag">ℹ</span>
              </label>

              <label className="seo-checkbox-label">
                <input
                  type="checkbox"
                  checked={value.include_sitemap ?? true} 
                  onChange={(e) => onChange({ ...value, include_sitemap: e.target.checked })}
                />
                Include this page in sitemap
                <span className="seo-info" title="Controls whether this URL appears in sitemap.xml">ℹ</span>
              </label>
            </div>

            <div className="seo-priority-row">
              <div className="seo-field-group">
                <label className="seo-label">
                  Sitemap Priority
                  <span className="seo-info" title="Value between 0.0 and 1.0">ℹ</span>
                </label>
                <input
                  className="seo-input"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  placeholder="0.5"
                  value={value.sitemap_priority ?? "0.5"}   
                  onChange={handle("sitemap_priority")}
                />
              </div>

              <div className="seo-field-group">
                <label className="seo-label">
                  Change Frequency
                  <span className="seo-info" title="How frequently the page content changes">ℹ</span>
                </label>
                <select
                  className="seo-input seo-select"
                  value={value.change_frequency ?? "daily"}  
                  onChange={handle("change_frequency")}
                >
                  <option value="always">Always</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="never">Never</option>
                </select>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default SeoPreview;