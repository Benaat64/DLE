import { FaTwitter, FaTwitch, FaInstagram, FaFacebook, FaDiscord } from "react-icons/fa";
import { PiThreadsLogoFill } from "react-icons/pi";
import type { LolPlayerData } from "./types";

type SocialMedia = LolPlayerData["socialMedia"];

const socialLinks = [
  { key: "twitter", title: "Twitter", icon: FaTwitter, color: "bg-blue-500 hover:bg-blue-600" },
  { key: "twitch", title: "Twitch", icon: FaTwitch, color: "bg-purple-600 hover:bg-purple-700" },
  { key: "instagram", title: "Instagram", icon: FaInstagram, color: "bg-pink-600 hover:bg-pink-700" },
  { key: "facebook", title: "Facebook", icon: FaFacebook, color: "bg-blue-800 hover:bg-blue-900" },
  { key: "discord", title: "Discord", icon: FaDiscord, color: "bg-indigo-600 hover:bg-indigo-700" },
  { key: "tiktok", title: "TikTok", icon: PiThreadsLogoFill, color: "bg-black hover:bg-gray-900" },
] as const;

export default function PlayerSocialLinks({ socialMedia }: { socialMedia: SocialMedia }) {
  if (!socialMedia || !Object.values(socialMedia).some(Boolean)) return null;

  return (
    <section className="border-t border-gray-600">
      <h3 className="bg-blue-900 py-2 px-4 text-white font-bold">Social Media</h3>
      <div className="p-3 bg-gray-700 flex flex-wrap gap-4 justify-center">
        {socialLinks.map(({ key, title, icon: Icon, color }) => {
          const href = socialMedia[key];
          if (!href) return null;
          return (
            <a key={key} href={href} target="_blank" rel="noopener noreferrer"
              className={`p-3 rounded-full text-white transition-colors ${color}`}
              title={key === "tiktok" && href.includes("threads.net") ? "Threads" : title}
              aria-label={key === "tiktok" && href.includes("threads.net") ? "Threads" : title}>
              <Icon size={24} />
            </a>
          );
        })}
      </div>
    </section>
  );
}
