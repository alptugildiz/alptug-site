import JSONFormatter from "./components/JSONFormatter";
import QRCodeReader from "./components/QRCodeReader";
import QRCodeGenerator from "./components/QRCodeGenerator";
import { Tool } from "./types";

export const getTools = (toolsData: any[]): Tool[] => {
  return toolsData.map((tool) => ({
    id: tool.id,
    name: tool.name,
    description: tool.description,
    component:
      tool.id === "qr-reader"
        ? QRCodeReader
        : tool.id === "qr-generator"
        ? QRCodeGenerator
        : JSONFormatter,
  }));
};

export const getToolById = (id: string, toolsData: any[]) =>
  toolsData.find((tool) => tool.id === id);
