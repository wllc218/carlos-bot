import { exec } from "child_process";
import path from "path";
import sharp from "sharp";
import videos from "../data/videos.json" with { type: "json" };

export const name = "printguess";
export function execute(message) {
  console.log(videos);
}
