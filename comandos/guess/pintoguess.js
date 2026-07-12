import videos from "../../data/videos.json" with { type: "json" };
import { spawn } from "child_process";
export const name = "pintoguess";
export function execute(message) {
  let link = [...Object.values(videos)];

  const categorias = (Object.keys(videos));
  const randomVideo = Math.floor(Math.random);
}
