type NodeType = "text" | "button" | "input" | "grid";

type Cell = {
  row?: number;
  col?: number;
  rowSpan?: number;
  colSpan?: number;
};

type Column = {
  sizeMode: "fr" | "px" | "auto";
  size?: number;
  alignment?: "start" | "center" | "end";
};

type Row = Column;

class Node {
  type: NodeType;
  props: Record<string, any> = {};
  children: Node[] = [];
  cell?: Cell;

  constructor(type: NodeType) {
    this.type = type;
  }

  // layout

  row(n: number) { this.cell = { ...this.cell, row: n }; return this; }
  col(n: number) { this.cell = { ...this.cell, col: n }; return this; }
  rowSpan(n: number) { this.cell = { ...this.cell, rowSpan: n }; return this; }
  colSpan(n: number) { this.cell = { ...this.cell, colSpan: n }; return this; }

  // composition

  add(...nodes: Node[]) {
    this.children.push(...nodes);
    return this;
  }

  // generic props

  set(key: string, value: any) {
    this.props[key] = value;
    return this;
  }

  toJSON(): any {
    return {
      type: this.type,
      ...this.props,
      ...(this.cell ? { cell: this.cell } : {}),
      ...(this.children.length ? { children: this.children.map(c => c.toJSON()) } : {})
    };
  }
}

function text(value: string) {
  return new Node("text").set("text", value);
}

function button(label: string) {
  return new Node("button").set("text", label);
}

function input(placeholder?: string) {
  const n = new Node("input");
  if (placeholder) n.set("placeholder", placeholder);
  return n;
}

function col(config: Column): Column {
  return config;
}

function row(config: Row): Row {
  return config;
}

function grid(config: {
  columns: Column[];
  rows: Row[];
  columnGap?: string;
  rowGap?: string;
  width?: string;
  padding?: string;
  backgroundColor?: string;
}) {
  const n = new Node("grid");
  Object.assign(n.props, config);
  return n;
}

const layout =
  grid({
    columns: [
      col({ sizeMode: "fr", size: 1 }),
      col({ sizeMode: "fr", size: 1 })
    ],
    rows: [
      row({ sizeMode: "auto" }),
      row({ sizeMode: "auto" })
    ],
    columnGap: "16px",
    rowGap: "16px",
    padding: "16px"
  })
  .add(
    text("Hello World")
      .set("fontSize", 16)
      .set("textAlign", "center")
      .row(0).col(0).colSpan(2),

    button("Click")
      .row(1).col(0),

    input("Type here")
      .row(1).col(1)
  );

console.log(layout.toJSON());