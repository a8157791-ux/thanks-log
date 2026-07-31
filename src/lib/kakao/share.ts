"use client";

// Minimal typing for the bits of the Kakao JS SDK we actually call.
// (The SDK has no official TS types; this keeps `any` contained to one place.)
type KakaoSdk = {
  isInitialized: () => boolean;
  init: (jsKey: string) => void;
  Share: {
    sendDefault: (options: {
      objectType: "feed";
      content: {
        title: string;
        description: string;
        imageUrl: string;
        link: { mobileWebUrl: string; webUrl: string };
      };
      buttons: { title: string; link: { mobileWebUrl: string; webUrl: string } }[];
    }) => void;
  };
};

declare global {
  interface Window {
    Kakao?: KakaoSdk;
  }
}

const KAKAO_SDK_SRC = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";

let sdkLoadPromise: Promise<void> | null = null;

function loadKakaoSdk(): Promise<void> {
  if (window.Kakao) return Promise.resolve();
  if (sdkLoadPromise) return sdkLoadPromise;

  sdkLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = KAKAO_SDK_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      sdkLoadPromise = null;
      reject(new Error("kakao_sdk_load_failed"));
    };
    document.head.appendChild(script);
  });
  return sdkLoadPromise;
}

export type ShareMethod = "kakao" | "webshare" | "clipboard";

/** Shares an invite link via KakaoTalk (if the JS SDK key is configured), falling
 * back to the native share sheet, then to a clipboard copy. Returns which path
 * actually completed so the caller can show the right feedback. */
export async function shareInviteLink(url: string, inviterName: string): Promise<ShareMethod> {
  const jsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

  if (jsKey) {
    try {
      await loadKakaoSdk();
      const Kakao = window.Kakao;
      if (Kakao) {
        if (!Kakao.isInitialized()) Kakao.init(jsKey);
        Kakao.Share.sendDefault({
          objectType: "feed",
          content: {
            title: "땡큐로그 친구 초대",
            description: `${inviterName}님이 감사일기를 함께 쓰자고 초대했어요`,
            imageUrl: `${window.location.origin}/icon-512.png`,
            link: { mobileWebUrl: url, webUrl: url },
          },
          buttons: [{ title: "초대 수락하기", link: { mobileWebUrl: url, webUrl: url } }],
        });
        return "kakao";
      }
    } catch {
      // SDK failed to load (blocked, offline, key invalid) — fall through below.
    }
  }

  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title: "땡큐로그 친구 초대", text: `${inviterName}님이 초대했어요`, url });
      return "webshare";
    } catch {
      // user cancelled the share sheet, or unsupported — fall through to clipboard.
    }
  }

  await navigator.clipboard.writeText(url);
  return "clipboard";
}
