import re

# Read the file
with open('d:/Visconde/gerador-ofertas-especiais/components/Controls-original.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove TabType
content = re.sub(r"type TabType = .*?;\s*\n", "", content)

# Remove activeTab state
content = re.sub(r"const \[activeTab, setActiveTab\] = useState<TabType>\('tema'\);\s*\n", "", content)

# Remove tabs array
content = re.sub(r"const tabs = \[[\s\S]*?\];\s*\n", "", content)

# Remove tab navigation UI
content = re.sub(
    r"{/\* Tabs Navigation.*?\*/}[\s\S]*?{/\* Tab Content \*/}",
    "{/* Accordion Sections */}",
    content,
    flags=re.DOTALL
)

# Replace tab conditionals with AccordionSection
# First section (tema) - already has AccordionSection start, just need to close it properly
content = re.sub(
    r"(\s+</section>\s+</>\s+\)\})\s+{/\* DESIGN TAB \*/}\s+{activeTab === 'design' && \(",
    r"\n        </AccordionSection>\n\n        <AccordionSection\n          id=\"design-layout\"\n          title=\"Design & Layout\"\n          icon=\"brush\"\n          defaultOpen={false}\n        >",
    content
)

# Design section
content = re.sub(
    r"(\s+</section>\s+</>\s+\)\})\s+{/\* HEADER TAB \*/}\s+{activeTab === 'cabecalho' && \(",
    r"\n        </AccordionSection>\n\n        <AccordionSection\n          id=\"header\"\n          title=\"Cabeçalho\"\n          icon=\"vertical_align_top\"\n          defaultOpen={false}\n        >",
    content
)

# Header section  
content = re.sub(
    r"(\s+</section>\s+</>\s+\)\})\s+{/\* FOOTER TAB \*/}\s+{activeTab === 'rodape' && \(",
    r"\n        </AccordionSection>\n\n        <AccordionSection\n          id=\"footer\"\n          title=\"Rodapé\"\n          icon=\"vertical_align_bottom\"\n          defaultOpen={false}\n        >",
    content
)

# Footer section
content = re.sub(
    r"(\s+</section>\s+</>\s+\)\})\s+{/\* PRODUCTS TAB \*/}\s+{activeTab === 'produtos' && \(",
    r"\n        </AccordionSection>\n\n        <AccordionSection\n          id=\"products\"\n          title=\"Produtos\"\n          icon=\"inventory_2\"\n          badge={state.products.length}\n          defaultOpen={false}\n        >",
    content
)

# Close last section before </div>
content = re.sub(
    r"(</ImageGalleryModal>\s+</>\s+\)\})\s+(</div>\s+</aside>)",
    r"\1\n        </AccordionSection>\n      \2",
    content
)

# Remove remaining fragment wrappers
content = re.sub(r"\s+<>\s+\n", "\n", content)
content = re.sub(r"\s+</>\s+\n", "\n", content)

# Write the transformed file
with open('d:/Visconde/gerador-ofertas-especiais/components/Controls.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Transformation complete!")
