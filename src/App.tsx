import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Clock, 
  BookOpen, 
  AlertTriangle, 
  Image as ImageIcon, 
  ArrowLeft, 
  ArrowRight, 
  CornerUpLeft, 
  Sparkles
} from 'lucide-react';

// --- Type Definitions ---

type UnitType = 'extinction' | 'explosion' | undefined;

interface GeologicalNode {
  id?: string;
  name: string;
  englishName: string;
  image: string;
  start?: number;
  end?: number;
  theme?: string;
  description?: string | React.ReactNode;
  children?: GeologicalNode[];
  type?: UnitType;
  time?: string;
  desc?: string | React.ReactNode;
}

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackColor?: string;
  type?: UnitType;
}

interface SpecialEventBarProps {
  data: GeologicalNode;
  onSelect: (node: GeologicalNode) => void;
  depth?: number;
}

interface DetailPanelProps {
  unit: GeologicalNode | null;
  onClose: () => void;
  onNavigate: (node: GeologicalNode) => void;
}

interface TimelineItemProps {
  data: GeologicalNode;
  depth?: number;
  onSelect: (node: GeologicalNode) => void;
  themeColor?: string;
}

interface NavInfo {
  unit: GeologicalNode;
  parent: GeologicalNode | null;
  prev: GeologicalNode | null;
  next: GeologicalNode | null;
  olderSibling: GeologicalNode | null;
  youngerSibling: GeologicalNode | null;
}

// --- Theme Configuration (靜態樣式表) ---
// 這裡將所有完整的 class 名稱列出，讓 Tailwind CSS 能夠正確掃描到它們。

interface ThemeStyle {
  levels: { bg: string; text: string; border: string; hover: string }[];
  line: string;
  dashedBorder: string;
}

const themeStyles: Record<string, ThemeStyle> = {
  sky: {
    levels: [
      { bg: 'bg-sky-50', text: 'text-sky-900', border: 'border-sky-200', hover: 'hover:border-sky-400' },
      { bg: 'bg-sky-100', text: 'text-sky-900', border: 'border-sky-300', hover: 'hover:border-sky-500' },
      { bg: 'bg-sky-200', text: 'text-sky-900', border: 'border-sky-400', hover: 'hover:border-sky-600' },
      { bg: 'bg-sky-300', text: 'text-sky-900', border: 'border-sky-500', hover: 'hover:border-sky-700' },
    ],
    line: 'bg-sky-900/20',
    dashedBorder: 'border-sky-200'
  },
  emerald: {
    levels: [
      { bg: 'bg-emerald-50', text: 'text-emerald-900', border: 'border-emerald-200', hover: 'hover:border-emerald-400' },
      { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-300', hover: 'hover:border-emerald-500' },
      { bg: 'bg-emerald-200', text: 'text-emerald-900', border: 'border-emerald-400', hover: 'hover:border-emerald-600' },
      { bg: 'bg-emerald-300', text: 'text-emerald-900', border: 'border-emerald-500', hover: 'hover:border-emerald-700' },
    ],
    line: 'bg-emerald-900/20',
    dashedBorder: 'border-emerald-200'
  },
  cyan: {
    levels: [
      { bg: 'bg-cyan-50', text: 'text-cyan-900', border: 'border-cyan-200', hover: 'hover:border-cyan-400' },
      { bg: 'bg-cyan-100', text: 'text-cyan-900', border: 'border-cyan-300', hover: 'hover:border-cyan-500' },
      { bg: 'bg-cyan-200', text: 'text-cyan-900', border: 'border-cyan-400', hover: 'hover:border-cyan-600' },
      { bg: 'bg-cyan-300', text: 'text-cyan-900', border: 'border-cyan-500', hover: 'hover:border-cyan-700' },
    ],
    line: 'bg-cyan-900/20',
    dashedBorder: 'border-cyan-200'
  },
  orange: {
    levels: [
      { bg: 'bg-orange-50', text: 'text-orange-900', border: 'border-orange-200', hover: 'hover:border-orange-400' },
      { bg: 'bg-orange-100', text: 'text-orange-900', border: 'border-orange-300', hover: 'hover:border-orange-500' },
      { bg: 'bg-orange-200', text: 'text-orange-900', border: 'border-orange-400', hover: 'hover:border-orange-600' },
      { bg: 'bg-orange-300', text: 'text-orange-900', border: 'border-orange-500', hover: 'hover:border-orange-700' },
    ],
    line: 'bg-orange-900/20',
    dashedBorder: 'border-orange-200'
  },
  rose: {
    levels: [
      { bg: 'bg-rose-50', text: 'text-rose-900', border: 'border-rose-200', hover: 'hover:border-rose-400' },
      { bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-300', hover: 'hover:border-rose-500' },
      { bg: 'bg-rose-200', text: 'text-rose-900', border: 'border-rose-400', hover: 'hover:border-rose-600' },
      { bg: 'bg-rose-300', text: 'text-rose-900', border: 'border-rose-500', hover: 'hover:border-rose-700' },
    ],
    line: 'bg-rose-900/20',
    dashedBorder: 'border-rose-200'
  },
  amber: {
    levels: [
      { bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-200', hover: 'hover:border-amber-400' },
      { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300', hover: 'hover:border-amber-500' },
      { bg: 'bg-amber-200', text: 'text-amber-900', border: 'border-amber-400', hover: 'hover:border-amber-600' },
      { bg: 'bg-amber-300', text: 'text-amber-900', border: 'border-amber-500', hover: 'hover:border-amber-700' },
    ],
    line: 'bg-amber-900/20',
    dashedBorder: 'border-amber-200'
  },
  violet: {
    levels: [
      { bg: 'bg-violet-50', text: 'text-violet-900', border: 'border-violet-200', hover: 'hover:border-violet-400' },
      { bg: 'bg-violet-100', text: 'text-violet-900', border: 'border-violet-300', hover: 'hover:border-violet-500' },
      { bg: 'bg-violet-200', text: 'text-violet-900', border: 'border-violet-400', hover: 'hover:border-violet-600' },
      { bg: 'bg-violet-300', text: 'text-violet-900', border: 'border-violet-500', hover: 'hover:border-violet-700' },
    ],
    line: 'bg-violet-900/20',
    dashedBorder: 'border-violet-200'
  },
  slate: {
    levels: [
      { bg: 'bg-slate-50', text: 'text-slate-900', border: 'border-slate-200', hover: 'hover:border-slate-400' },
      { bg: 'bg-slate-100', text: 'text-slate-900', border: 'border-slate-300', hover: 'hover:border-slate-500' },
      { bg: 'bg-slate-200', text: 'text-slate-900', border: 'border-slate-400', hover: 'hover:border-slate-600' },
      { bg: 'bg-slate-300', text: 'text-slate-900', border: 'border-slate-500', hover: 'hover:border-slate-700' },
    ],
    line: 'bg-slate-900/20',
    dashedBorder: 'border-slate-200'
  }
};

// --- Helper Functions ---

const getThemeStyles = (theme: string) => {
  return themeStyles[theme] || themeStyles['slate'];
};

const getThemeLevelColors = (theme: string, depth = 0) => {
  const styles = getThemeStyles(theme);
  return styles.levels[Math.min(depth, styles.levels.length - 1)];
};

// --- Data ---

const geologicalData: GeologicalNode[] = [
  {
    id: 'phanerozoic',
    name: '顯生宙 (Phanerozoic)',
    englishName: 'Phanerozoic',
    start: 538.8,
    end: 0,
    theme: 'sky',
    // ★ 修改這裡：將 description 改成豐富的圖文排版
    description: (
      <>
        <span className="font-bold text-gray-900 block mb-3 text-xl">
          顯著生命的時代：從寒武紀到現代
        </span>
        <span className="block leading-relaxed mb-4">
          「顯生宙」意為「可見的生命」，標誌著複雜多細胞生物大量繁衍的時期。從寒武紀大爆發開始，地球生命形式經歷了爆炸性的多樣化，無脊椎動物、魚類、兩棲類、爬行類、恐龍、鳥類與哺乳動物相繼登上歷史舞台。
        </span>
        <span className="block leading-relaxed">
          這個時期包含了古生代、中生代與新生代，見證了多次生物大滅絕與復甦，也是植物登陸並覆蓋地表的關鍵時期。我們目前就生活在顯生宙的最後一刻。
        </span>
      </>
    ),
    image: 'Phanerozoic.jpg',
    children: [
      {
        type: 'extinction',
        id: 'holocene_extinction',
        name: '第六次大滅絕 (進行中)',
        englishName: 'Holocene Extinction',
        time: '現在',
        image: 'Holocene_Extinction.jpg',
        // 修改 desc 如下：
        desc: (
          <>
            <span className="font-bold text-gray-900 block mb-4 text-xl">
            【全新世滅絕：一場由人類導演的無聲告別】
            </span>
            <span className="block leading-relaxed">
            如果說地球過去的五次大滅絕是系統的「自然重開機」（像是隕石撞擊導致恐龍滅絕），那麼我們現在經歷的「全新世滅絕」(又稱第六次大滅絕)，則是一場由人類親手按下刪除鍵的危機。這場滅絕的獨特之處在於「速度」與「成因」。從一萬年前長毛象等巨型動物倒在人類的長矛下開始，到今日熱帶雨林被推土機夷平，無數物種(據估計每年達 14 萬種)甚至還來不及被取名就已消失。這不是氣候的自然循環，而是人為的擴張。數據顯示，自文明誕生以來，已有 83% 的野生動物永遠離開了舞台。這不只是數字的減少，而是地球這本豐富的「生命圖書館」，正在被我們以史無前例的速度撕毀。
            </span>
          </>
        )
      },
      {
        id: 'cenozoic',
        name: '新生代 (Cenozoic)',
        englishName: 'Cenozoic',
        start: 66.0,
        end: 0,
        theme: 'emerald',
        description: (
          <>
            <span className="font-bold text-gray-900 block mb-3 text-xl">
            【新生代：冷卻星球上的哺乳霸業】
            </span>
            <span className="font-bold text-gray-900 block mb-3 text-xl">
            (The Cenozoic Era: The Mammalian Dominance on a Cooling Planet)
            </span>
            <span className="block leading-relaxed mb-4">
            如果說中生代是一場狂熱的「夏日派對」，那麼距今 6600 萬年開啟的新生代，就是派對結束後，地球逐漸將空調溫度調低的「冷靜期」。在恐龍滅絕後的初期，地球依然相當溫暖，但隨著時間推移，一場劇烈的地質運動改變了一切：印度板塊像一輛失控的卡車狠狠撞向歐亞大陸，隆起了雄偉的喜馬拉雅山脈 。這場造山運動加速了岩石風化，大量消耗了大氣中的二氧化碳，導致全球氣溫開始一路下滑。原本覆蓋全球的茂密雨林開始退縮，取而代之的是更加開闊、乾燥且耐寒的「草原生態系」。地球的地貌從單一的綠色叢林，變成了四季分明、冰雪與草原交織的複雜世界，這種環境的劇變迫使生命必須學會適應寒冷與長途遷徙。
            </span>
            <span className="block leading-relaxed">
            在這個逐漸變冷且視野開闊的新舞台上，生命上演了一場名為「小卒變英雄」的勵志劇。那些曾經在恐龍腳下瑟瑟發抖、體型如老鼠般的哺乳動物，迅速填補了恐龍留下的真空。牠們不再只是躲在地洞裡，而是大膽地走向海洋（演化成鯨魚）、飛向天空（演化成蝙蝠），並奔馳在廣闊的草原上。為了適應草原生活，動物們演化出了更修長的腿（為了逃跑或追捕）和更複雜的社會行為。更有趣的是，草原的出現推動了一種特殊的演化壓力——在沒有樹木遮蔽的開闊地上，「腦力」變得比蠻力更重要。正是在這種環境下，靈長類動物開始直立行走，解放雙手，並最終點燃了智慧的火花。新生代不只是哺乳類的時代，更是智慧生命在嚴酷氣候中磨練成形的關鍵篇章。
            </span>
          </>
        ),
        image: 'Cenozoic.jpg',
        children: [
          {
            id: 'quaternary',
            name: '第四紀 (Quaternary)',
            englishName: 'Quaternary',
            start: 2.58,
            end: 0,
            description: (
              <>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                  顯著生命的時代：從寒武紀到現代
                </span>
                <span className="block leading-relaxed mb-4">
                  「顯生宙」意為「可見的生命」，標誌著複雜多細胞生物大量繁衍的時期。從寒武紀大爆發開始，地球生命形式經歷了爆炸性的多樣化，無脊椎動物、魚類、兩棲類、爬行類、恐龍、鳥類與哺乳動物相繼登上歷史舞台。
                </span>
                <span className="block leading-relaxed">
                  這個時期包含了古生代、中生代與新生代，見證了多次生物大滅絕與復甦，也是植物登陸並覆蓋地表的關鍵時期。我們目前就生活在顯生宙的最後一刻。
                </span>
              </>
            ),
            image: 'Quaternary.jpg',
            children: [
              { 
                id: 'holocene', 
                name: '全新世 (Holocene)', 
                englishName: 'Holocene', 
                start: 0.0117, 
                end: 0, 
                image: 'Holocene.jpg',
                description: (
                  <>
                    <span className="font-bold text-gray-900 block mb-3 text-xl">
                    【全新世：人類文明登場的「黃金舞台」】
                    </span>
                    <span className="block leading-relaxed mb-4">
                    全新世(Holocene)，希臘文意為「完全新近的」，這不僅是地質年代表上最新的一頁，更是人類文明專屬的「黃金時段」。這段時期氣候趨於溫暖穩定，恰好提供了完美的環境，讓人類從新石器時代一路發展至今日的科技社會。
                    </span>
                    <span className="block leading-relaxed">
                    科學家就像閱讀「大自然的日記本」一樣，透過鑽取冰芯、觀察樹木年輪與鐘乳石，解讀這段氣候歷史。雖然這段時期相對平穩，但地球的舞台佈景仍持續變動：板塊漂移重塑了洋流與生態(如南北美洲的物種大遷徙)，而偶發的隕石撞擊與劇烈海嘯，更可能成為了人類神話中「大洪水」或「諾亞方舟」的靈感原點。簡言之，全新世就是一部地質力量與人類故事緊密交織的史詩。
                    </span>
                  </>
                )
              },
              { 
                id: 'pleistocene', 
                name: '更新世 (Pleistocene)', 
                englishName: 'Pleistocene', 
                start: 2.58, 
                end: 0.0117, 
                image: 'Pleistocene.jpg',
                description: (
                  <>
                    <span className="font-bold text-gray-900 block mb-3 text-xl">
                    【更新世：冰河世紀與人類的壯遊起點】
                    </span>
                    <span className="block leading-relaxed mb-4">
                    更新世(Pleistocene)聽起來很陌生，但如果我說「冰原歷險記」，你一定秒懂！這就是那個猛獁象與劍齒虎漫步的「冰河時代」。
                    </span>
                    <span className="block leading-relaxed">
                    這段時期，地球像是一個正在打寒顫的巨人，反覆經歷著冰凍(冰期)與解凍(間冰期)的循環。最冷的時候，地球表面有 30% 都被厚重的冰層覆蓋。更有趣的是，因為大量海水結成了冰，海平面大幅下降(比現在低了約 120 公尺)，原本隔海相望的大陸之間露出了「海底陸橋」(如連接亞洲與北美的白令陸橋)。這對我們至關重要，因為人類(人屬)正是在這段嚴酷的時期登場，並利用這些大自然臨時搭建的橋樑，完成了走出非洲、擴散至全球的「史詩級壯遊」。
                    </span>
                  </>
                )
              },
            ]
          },
          {
            id: 'neogene',
            name: '新近紀 (Neogene)',
            englishName: 'Neogene',
            start: 23.03,
            end: 2.58,
            description: (
              <>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                  顯著生命的時代：從寒武紀到現代
                </span>
                <span className="block leading-relaxed mb-4">
                  「顯生宙」意為「可見的生命」，標誌著複雜多細胞生物大量繁衍的時期。從寒武紀大爆發開始，地球生命形式經歷了爆炸性的多樣化，無脊椎動物、魚類、兩棲類、爬行類、恐龍、鳥類與哺乳動物相繼登上歷史舞台。
                </span>
                <span className="block leading-relaxed">
                  這個時期包含了古生代、中生代與新生代，見證了多次生物大滅絕與復甦，也是植物登陸並覆蓋地表的關鍵時期。我們目前就生活在顯生宙的最後一刻。
                </span>
              </>
            ),
            image: 'Neogene.jpg',
            children: [
              { id: 'pliocene',
                name: '上新世 (Pliocene)',
                englishName: 'Pliocene',
                start: 5.333,
                end: 2.58,
                image: 'Pliocene.jpg',
                description: (
                  <>
                    <span className="font-bold text-gray-900 block mb-3 text-xl">
                      顯著生命的時代：從寒武紀到現代
                    </span>
                    <span className="block leading-relaxed mb-4">
                      「顯生宙」意為「可見的生命」，標誌著複雜多細胞生物大量繁衍的時期。從寒武紀大爆發開始，地球生命形式經歷了爆炸性的多樣化，無脊椎動物、魚類、兩棲類、爬行類、恐龍、鳥類與哺乳動物相繼登上歷史舞台。
                    </span>
                    <span className="block leading-relaxed">
                      這個時期包含了古生代、中生代與新生代，見證了多次生物大滅絕與復甦，也是植物登陸並覆蓋地表的關鍵時期。我們目前就生活在顯生宙的最後一刻。
                    </span>
                  </>
                ),
              },
             
              { id: 'miocene',
                name: '中新世 (Miocene)',
                englishName: 'Miocene',
                start: 23.03,
                end: 5.333,
                image: 'Miocene.jpg',
                description: (
                  <>
                    <span className="font-bold text-gray-900 block mb-3 text-xl">
                      顯著生命的時代：從寒武紀到現代
                    </span>
                    <span className="block leading-relaxed mb-4">
                      「顯生宙」意為「可見的生命」，標誌著複雜多細胞生物大量繁衍的時期。從寒武紀大爆發開始，地球生命形式經歷了爆炸性的多樣化，無脊椎動物、魚類、兩棲類、爬行類、恐龍、鳥類與哺乳動物相繼登上歷史舞台。
                    </span>
                    <span className="block leading-relaxed">
                      這個時期包含了古生代、中生代與新生代，見證了多次生物大滅絕與復甦，也是植物登陸並覆蓋地表的關鍵時期。我們目前就生活在顯生宙的最後一刻。
                    </span>
                  </>
                ),
               }
            ]
          },
          {
            id: 'paleogene',
            name: '古近紀 (Paleogene)',
            englishName: 'Paleogene',
            start: 66.0,
            end: 23.03,
            description: '恐龍滅絕後，哺乳動物填補生態位。',
            image: 'Paleogene.jpg',
            children: [
              { id: 'oligocene',
                name: '漸新世 (Oligocene)',
                englishName: 'Oligocene',
                start: 33.9,
                end: 23.03,
                image: 'Oligocene.jpg',
                description: (
                  <>
                    <span className="font-bold text-gray-900 block mb-3 text-xl">
                      顯著生命的時代：從寒武紀到現代
                    </span>
                    <span className="block leading-relaxed mb-4">
                      「顯生宙」意為「可見的生命」，標誌著複雜多細胞生物大量繁衍的時期。從寒武紀大爆發開始，地球生命形式經歷了爆炸性的多樣化，無脊椎動物、魚類、兩棲類、爬行類、恐龍、鳥類與哺乳動物相繼登上歷史舞台。
                    </span>
                    <span className="block leading-relaxed">
                      這個時期包含了古生代、中生代與新生代，見證了多次生物大滅絕與復甦，也是植物登陸並覆蓋地表的關鍵時期。我們目前就生活在顯生宙的最後一刻。
                    </span>
                  </>
                ),
               },
            
              { id: 'eocene',
                name: '始新世 (Eocene)',
                englishName: 'Eocene',
                start: 56.0,
                end: 33.9,
                image: 'Eocene.jpg',
                description: (
                  <>
                    <span className="font-bold text-gray-900 block mb-3 text-xl">
                      顯著生命的時代：從寒武紀到現代
                    </span>
                    <span className="block leading-relaxed mb-4">
                      「顯生宙」意為「可見的生命」，標誌著複雜多細胞生物大量繁衍的時期。從寒武紀大爆發開始，地球生命形式經歷了爆炸性的多樣化，無脊椎動物、魚類、兩棲類、爬行類、恐龍、鳥類與哺乳動物相繼登上歷史舞台。
                    </span>
                    <span className="block leading-relaxed">
                      這個時期包含了古生代、中生代與新生代，見證了多次生物大滅絕與復甦，也是植物登陸並覆蓋地表的關鍵時期。我們目前就生活在顯生宙的最後一刻。
                    </span>
                  </>
                ),
               },
             
              { id: 'paleocene',
                name: '古新世 (Paleocene)',
                englishName: 'Paleocene',
                start: 66.0,
                end: 56.0,
                image: 'Paleocene.jpg',
                description: (
                  <>
                    <span className="font-bold text-gray-900 block mb-3 text-xl">
                      顯著生命的時代：從寒武紀到現代
                    </span>
                    <span className="block leading-relaxed mb-4">
                      「顯生宙」意為「可見的生命」，標誌著複雜多細胞生物大量繁衍的時期。從寒武紀大爆發開始，地球生命形式經歷了爆炸性的多樣化，無脊椎動物、魚類、兩棲類、爬行類、恐龍、鳥類與哺乳動物相繼登上歷史舞台。
                    </span>
                    <span className="block leading-relaxed">
                      這個時期包含了古生代、中生代與新生代，見證了多次生物大滅絕與復甦，也是植物登陸並覆蓋地表的關鍵時期。我們目前就生活在顯生宙的最後一刻。
                    </span>
                  </>
                ),
               }
            ]
          }
        ]
      },
      {
        type: 'extinction',
        id: 'k_pg_extinction',
        name: '第五次大滅絕 (K-Pg)',
        englishName: 'K-Pg Extinction',
        time: '66.0 Ma',
        image: 'K_Pg_Extinction.jpg',
        desc: (
          <>
            <span className="font-bold text-red-800 block mb-3 text-xl">
              恐龍時代的終結：小行星撞擊與環境劇變
            </span>
            <span className="block leading-relaxed mb-4">
              發生於約 6600 萬年前的白堊紀─古近紀滅絕事件，是地球歷史上最近一次的大滅絕。最廣為接受的成因是一顆直徑約 10 公里的小行星撞擊了今日墨西哥的希克蘇魯伯地區。
            </span>
            <span className="block leading-relaxed">
              這次撞擊導致了全球性的氣候劇變，包括長期的「撞擊冬天」與光合作用停止。結果導致非鳥類恐龍全數滅絕，翼龍、滄龍與菊石也完全消失。這次事件雖然終結了爬行動物的統治，卻也為哺乳動物（以及後後來的人類）的崛起騰出了生態位。
            </span>
          </>
        )
      },
      {
        id: 'mesozoic',
        name: '中生代 (Mesozoic)',
        englishName: 'Mesozoic',
        start: 251.9,
        end: 66.0,
        theme: 'cyan',
        description: (
          <>
            <span className="font-bold text-gray-900 block mb-3 text-xl">
            【中生代：巨獸橫行的熱帶分裂帝國】
            </span>
            <span className="font-bold text-gray-900 block mb-3 text-xl">
            (The Mesozoic Era: The Tropical Empire of Giants and Continental Rifts)
            </span>
            <span className="block leading-relaxed mb-4">
            如果將地球歷史比作一棟房子，古生代是在打地基，而距今 2.5 億年到 6600 萬年前的中生代，則是地球進行最奢華裝修的「豪宅擴建期」。這個時代的地球地形發生了劇變，原本黏在一起的「盤古大陸」開始像一塊被剝開的巨大餅乾，分裂成我們今天熟悉的各個大洲。 這個漫長的「撕裂過程」雖然引發了無數火山與地震，卻也創造出了綿延的海岸線與新生的海洋（如大西洋的誕生）。更重要的是，中生代的地球是一個「超級溫室」——兩極完全沒有冰帽覆蓋，海平面高漲，溫暖潮濕的氣候從赤道一路延伸到高緯度地區。這種全球性的「恆溫泳池」環境，讓地球變成了一個巨大的熱帶叢林，為巨型生物的登場鋪好了紅地毯。
            </span>
            <span className="block leading-relaxed">
            在這個高溫且能量充沛的舞台上，生命不再滿足於匍匐前進，而是追求「巨大化與立體化」的極致。這是「爬行動物的黃金年代」，牠們接管了海、陸、空的所有領域：陸地上有震動大地的恐龍，海洋裡有凶猛的魚龍與滄龍，天空中有遮天蔽日的翼龍。與此同時，植物界也經歷了權力交接，高大的裸子植物（如松柏、蘇鐵）構成了鬱鬱蔥蔥的綠色天際線，而在中生代晚期，「開花植物」（被子植物）驚艷登場，為這顆原本只有綠褐色的星球第一次抹上了繽紛的色彩。 如果沒有中生代這場長達一億八千萬年的「高能量派對」，地球可能永遠無法孕育出如此複雜且龐大的生態系統。
            </span>
          </>
        ),
        image: 'Mesozoic.jpg',
        children: [
          {
            id: 'cretaceous',
            name: '白堊紀 (Cretaceous)',
            englishName: 'Cretaceous',
            start: 145.0,
            end: 66.0,
            description: (
              <>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                  顯著生命的時代：從寒武紀到現代
                </span>
                <span className="block leading-relaxed mb-4">
                  「顯生宙」意為「可見的生命」，標誌著複雜多細胞生物大量繁衍的時期。從寒武紀大爆發開始，地球生命形式經歷了爆炸性的多樣化，無脊椎動物、魚類、兩棲類、爬行類、恐龍、鳥類與哺乳動物相繼登上歷史舞台。
                </span>
                <span className="block leading-relaxed">
                  這個時期包含了古生代、中生代與新生代，見證了多次生物大滅絕與復甦，也是植物登陸並覆蓋地表的關鍵時期。我們目前就生活在顯生宙的最後一刻。
                </span>
              </>
            ),
            image: 'Cretaceous.jpg',
            children: []
          },
          {
            id: 'jurassic',
            name: '侏羅紀 (Jurassic)',
            englishName: 'Jurassic',
            start: 201.3,
            end: 145.0,
            description: (
              <>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                  顯著生命的時代：從寒武紀到現代
                </span>
                <span className="block leading-relaxed mb-4">
                  「顯生宙」意為「可見的生命」，標誌著複雜多細胞生物大量繁衍的時期。從寒武紀大爆發開始，地球生命形式經歷了爆炸性的多樣化，無脊椎動物、魚類、兩棲類、爬行類、恐龍、鳥類與哺乳動物相繼登上歷史舞台。
                </span>
                <span className="block leading-relaxed">
                  這個時期包含了古生代、中生代與新生代，見證了多次生物大滅絕與復甦，也是植物登陸並覆蓋地表的關鍵時期。我們目前就生活在顯生宙的最後一刻。
                </span>
              </>
            ),
            image: 'Jurassic.jpg',
            children: []
          },
          {
            type: 'extinction',
            id: 'tr_j_extinction',
            name: '第四次大滅絕 (Tr-J)',
            englishName: 'Tr-J Extinction',
            time: '201.3 Ma',
            image: 'Tr_J_Extinction.jpg',
            desc: (
              <>
                <span className="font-bold text-red-800 block mb-3 text-xl">
                【三疊紀—侏羅紀滅絕：恐龍皇朝的加冕禮】
                </span>
                <span className="font-bold text-red-800 block mb-3 text-xl">
                (The Triassic-Jurassic Extinction: The Coronation of the Dinosaur Dynasty)
                </span>
                <span className="block leading-relaxed mb-4">
                如果說侏羅紀是恐龍的「黃金盛世」，那麼三疊紀末期的這場滅絕事件，就是讓恐龍從「配角」晉升為「主角」的關鍵轉捩點。在兩億年前，恐龍雖然已經出現，但牠們的日子並不好過，當時地球的霸主其實是一群長得像鱷魚的兇猛爬行動物（偽鱷類）。然而，隨著超級大陸（盤古大陸）開始分裂，地殼被撕裂出一道道巨大的傷口，引發了地球史上規模最大的火山活動之一。大量的岩漿與溫室氣體噴發，讓地球瞬間變成了一個高溫、缺氧的「超級烤箱」。這場災難無情地清洗了海陸生態，導致約 76% 的物種就此消失。
                </span>
                <span className="block leading-relaxed">
                但這場浩劫對恐龍來說，卻是命運贈送的一張「頭獎彩券」。那些原本壓制著恐龍的競爭對手（巨大的鱷魚親戚們）因為無法適應劇變而紛紛滅絕，反倒是恐龍憑藉著獨特的生理優勢（或許是更高效的呼吸系統或保溫能力）奇蹟般地活了下來。當煙硝散去，恐龍發現原本擁擠的地球突然變得空蕩蕩的，所有的生態棲位都空了出來。於是，牠們迅速接管了這個世界，體型開始變得巨大化，正式開啟了長達一億多年的地球統治霸業。如果沒有這場滅絕事件「清場」，我們熟知的霸王龍與雷龍可能永遠沒有登場的機會。
                </span>
              </>
            )
          },
          {
            id: 'triassic',
            name: '三疊紀 (Triassic)',
            englishName: 'Triassic',
            start: 251.9,
            end: 201.3,
            description: (
              <>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                  顯著生命的時代：從寒武紀到現代
                </span>
                <span className="block leading-relaxed mb-4">
                  「顯生宙」意為「可見的生命」，標誌著複雜多細胞生物大量繁衍的時期。從寒武紀大爆發開始，地球生命形式經歷了爆炸性的多樣化，無脊椎動物、魚類、兩棲類、爬行類、恐龍、鳥類與哺乳動物相繼登上歷史舞台。
                </span>
                <span className="block leading-relaxed">
                  這個時期包含了古生代、中生代與新生代，見證了多次生物大滅絕與復甦，也是植物登陸並覆蓋地表的關鍵時期。我們目前就生活在顯生宙的最後一刻。
                </span>
              </>
            ),
            image: 'Triassic.jpg',
            children: []
          }
        ]
      },
      {
        type: 'extinction',
        id: 'p_tr_extinction',
        name: '第三次大滅絕 (P-Tr)',
        englishName: 'P-Tr Extinction',
        time: '251.9 Ma',
        image: 'P_Tr_Extinction.jpg',
        desc: (
          <>
            <span className="font-bold text-red-800 block mb-3 text-xl">
            【二疊紀—三疊紀滅絕：地球生命的瀕死重啟】
            </span>
            <span className="font-bold text-red-800 block mb-3 text-xl">
            (Permian-Triassic Extinction: The Great Dying and the Grand Reset)
            </span>
            <span className="block leading-relaxed mb-4">
            如果說其他的滅絕事件是地球生了一場大病，那麼發生在 2.52 億年前的二疊紀末期滅絕，簡直就是地球心跳停止的「瀕死體驗」。這被科學家稱為「大死亡」（The Great Dying），是地球史上最慘烈的一次歸零。當時，並沒有巨大的隕石撞擊，兇手來自地球內部——位於現今西伯利亞地區的「超級地函柱」爆發。這不是普通的火山噴發，而是持續數十萬年的岩漿洪流，覆蓋範圍相當於半個美國大。隨之釋放的巨量二氧化碳與甲烷，讓全球氣溫急劇飆升，海洋因為高溫而缺氧、酸化，變成了一鍋死寂的「紫色毒湯」。這場浩劫帶走了約 96% 的海洋生物與 70% 的陸地脊椎動物，連稱霸海洋兩億多年的三葉蟲也就此寫下了句點。
            </span>
            <span className="block leading-relaxed">
            然而，正是在這片死寂的廢墟中，演化的劇本被徹底改寫了。在災難之前，陸地上的霸主其實是我們的遠親——合弓綱動物（似哺乳爬行動物），如果不發生這場滅絕，哺乳類可能早就統治了地球。但因為這場「大重啟」，原本繁盛的合弓綱幾乎全軍覆沒，少數倖存者（如水龍獸）雖然撐過了浩劫，卻無力阻擋新勢力的崛起。生態系的真空狀態，給了另一支原本不起眼的演化支系——主龍類（Archosaurs）絕佳的機會。牠們憑藉著更高效的生理結構迅速佔領空缺，並最終演化出了恐龍。可以說，這場將生命逼入絕境的災難，諷刺地成為了恐龍王朝崛起的奠基石，也將哺乳類的輝煌時刻整整推遲了一億五千萬年。
            </span>
          </>
        )
      },
      {
        id: 'paleozoic',
        name: '古生代 (Paleozoic)',
        englishName: 'Paleozoic',
        start: 538.8,
        end: 251.9,
        theme: 'orange',
        description: (
          <>
            <span className="font-bold text-gray-900 block mb-3 text-xl">
            【古生代：從深藍海洋到翠綠陸地的拓荒史詩】
            </span>
            <span className="font-bold text-gray-900 block mb-3 text-xl">
            (The Paleozoic Era: The Epic Pioneering from Deep Blue to Emerald Green)
            </span>
            <span className="block leading-relaxed mb-4">
            如果將地球的歷史濃縮成一部電影，那麼跨越近 3 億年的古生代，絕對是場景變化最劇烈的「極限改造王」特輯。故事的開端（約 5.4 億年前），地球看起來還像是火星的孿生兄弟——陸地是一片赤紅的荒漠，所有精彩的生命都蜷縮在藍色的海洋裡。然而，隨著時間推移，這顆星球經歷了地質史上最瘋狂的板塊舞蹈：大陸分分合合，最終撞擊成巨大的「盤古大陸」。 與此同時，大氣層也經歷了翻天覆地的重組，氧氣濃度從稀薄一路飆升到「醉氧」的高峰。這不僅僅是歲月的流逝，而是一場物理與化學環境的「全面地球化工程」，將原本只有岩石與海水的單調世界，一步步改造成擁有森林、河流與複雜氣候系統的宜居星球。
            </span>
            <span className="block leading-relaxed">
            而在這不斷變動的舞台上，生命上演了一場史詩般的「登陸諾曼第」。古生代的故事主軸，就是生命如何克服對水的依賴，發起向陸地進軍的衝鋒。從最初在海裡穿著盔甲的三葉蟲，到鼓起勇氣爬上岸的兩棲類，再到最終演化出羊膜卵、能在沙漠中行走的爬行動物，生命展現了驚人的可塑性。這是一場接力賽：植物先鋒部隊率先登陸，將岩石轉化為土壤並釋放氧氣，隨後節肢動物與脊椎動物跟進，將荒涼的大陸變成了喧鬧的家園。雖然古生代最終在一場慘烈的大滅絕中落幕，但它確立了現代生態系的所有基礎規則——骨骼的架構、森林的運作、以及脊椎動物對陸地的統治權，全都是在這個時代奠定的。
            </span>
          </>
        ),
        image: 'Paleozoic.jpg',
        children: [
          {
            id: 'permian',
            name: '二疊紀 (Permian)',
            englishName: 'Permian',
            start: 298.9,
            end: 251.9,
            description: (
              <>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                【二疊紀：盤古大陸的燥熱極限挑戰】
                </span>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                (The Permian Period: The Scorching Endurance Test of Pangea)
                </span>
                <span className="block leading-relaxed mb-4">
                如果說之前的石炭紀是地球的一場「蒸汽桑拿浴」，那麼 2.99 億年前開啟的二疊紀，就是將這場桑拿突然關掉，換成了一個巨大的「乾燥烤箱」。這一切源於地質史上最驚人的一次「強制合併」——地球上所有的陸塊終於撞在一起，形成了唯一的超級大陸：「盤古大陸」（Pangea）。這塊大陸大得難以想像，導致了一個致命的後果：來自海洋的水氣根本無法到達廣闊的內陸。於是，石炭紀那些鬱鬱蔥蔥的濕地雨林崩潰了，取而代之的是一望無際的紅色沙漠與季節性的劇烈季風（超級季風）。對於那些習慣了皮膚濕潤、依賴水窪繁殖的兩棲類來說，這就像是原本住在豪華泳池別墅，突然被丟進了撒哈拉沙漠，生存空間被極度壓縮。
                </span>
                <span className="block leading-relaxed">
                然而，正是這種嚴酷的乾燥環境，逼出了演化史上最關鍵的一次「硬體升級」。為了不被烤乾，生命被迫發明了兩樣革命性的道具：「防水皮膚」與「羊膜卵」。植物界由耐旱的裸子植物（如銀杏、蘇鐵的祖先）接管了世界；而動物界則由我們的遠親——背上長著巨大帆狀物的「合弓綱」動物（如異齒龍） 登上了霸主寶座。羊膜卵就像是生物為胚胎準備的「私人行動泳池」，讓動物不再受限於水邊，可以大膽地向內陸深處挺進。如果沒有二疊紀這場極端的「乾燥壓力測試」，脊椎動物可能永遠只是在水邊徘徊的兩棲過客，而無法真正征服大陸的深處。
                </span>
              </>
            ),
            image: 'Permian.jpg',
            children: []
          },
          {
            id: 'carboniferous',
            name: '石炭紀 (Carboniferous)',
            englishName: 'Carboniferous',
            start: 358.9,
            end: 298.9,
            description: (
              <>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                【石炭紀：高氧充能的巨蟲迷霧森林】
                </span>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                (The Carboniferous Period: The Hyper-Oxygenated Misty Forest of Giants)
                </span>
                <span className="block leading-relaxed mb-4">
                如果說泥盆紀是地球的「綠化工程」，那麼 3.59 億年前的石炭紀，就是這項工程失控後形成的「全球蒸氣桑拿房」。當時的大陸板塊正緩慢地聚集成盤古大陸，廣闊的低地形成了無邊無際的熱帶沼澤濕地。這裡的景象與現代森林截然不同，你看不到熟悉的橡樹或松樹，取而代之的是高達 40 公尺的「鱗木」與「封印木」。這些像是巨大綠色電線桿的蕨類植物密集排列，遮蔽了天空，地表永遠瀰漫著濃霧與腐植質的氣味。這是一個極度潮濕、悶熱且暗無天日的環境，就像是一個沒有出口的巨型溫室，植物的生長速度快得驚人，將地球變成了一顆鬱鬱蔥蔥的「綠色毛球」。
                </span>
                <span className="block leading-relaxed">
                然而，這座森林最驚人的秘密藏在「空氣」裡。由於植物瘋狂地進行光合作用，加上當時的微生物還沒演化出分解木質素的能力，導致死去的樹木無法腐爛，大量的碳被鎖在地底（變成了今天的煤炭），而氧氣則被留在空氣中，使大氣含氧量飆升至史無前例的 35%（現今只有 21%）。這就像是給地球的大氣層打了「高濃度的興奮劑」，打破了生物體型的限制。對於依靠氣管呼吸的節肢動物來說，高氧環境意味著牠們可以長得無限巨大而不會缺氧。於是，展翼像老鷹一樣寬的巨脈蜻蜓（Meganeura） 飛舞在空中，長達兩公尺的巨型馬陸在林間穿梭。這是一個被高氧「充能」的巨獸時代，也是地球為人類預存下最多化石能源的「儲蓄期」。
                </span>
              </>
            ),
            image: 'Carboniferous.jpg',
            children: []
          },
          {
            type: 'extinction',
            id: 'late_devonian_extinction',
            name: '第二次大滅絕 (Late Devonian)',
            englishName: 'Late_Devonian_Extinction',
            time: '~372 Ma',
            image: 'Late_Devonian_Extinction.jpg',
            desc: (
              <>
                <span className="font-bold text-red-800 block mb-3 text-xl">
                【泥盆紀後期滅絕：森林崛起的無聲代價】
                </span>
                <span className="font-bold text-red-800 block mb-3 text-xl">
                (Late Devonian Extinction: The Silent Cost of the Rise of Forests)
                </span>
                <span className="block leading-relaxed mb-4">
                如果說二疊紀滅絕是火山的怒吼，那麼發生在 3.7 億年前的泥盆紀後期滅絕，則是一場由「綠色革命」引發的寧靜窒息。泥盆紀被稱為「魚類的時代」，當時海洋的霸主是身披重甲、咬合力驚人的「盾皮魚類」（如巨大的鄧氏魚），牠們就像是裝甲坦克般橫行無阻。然而，這場滅絕的兇手並非來自外太空，而是來自陸地上的新鄰居——第一批森林。隨著植物演化出強壯的根系，它們深入岩石吸取養分，卻意外地將大量的磷與礦物質沖刷進海洋。這就像是強迫海洋喝下了過量的「營養補給品」，引發了史無前例的藻類大爆發（優養化）。瘋狂生長的藻類死後耗盡了水中的氧氣，將原本生機勃勃的海洋變成了一個巨大的、缺氧的「死寂密室」，讓約 75% 的物種在窒息中無聲地消逝。
                </span>
                <span className="block leading-relaxed">
                這場生態浩劫雖然終結了「重裝甲魚類」的統治，卻意外地為現代魚類和我們的祖先開闢了道路。那些曾經不可一世、依賴重裝備防禦的盾皮魚類，因為無法適應缺氧環境而全數滅絕；反而是體型較小、更靈活且代謝需求較低的軟骨魚（鯊魚的祖先）與硬骨魚，憑藉著韌性倖存了下來。更有趣的是，缺氧的海洋環境可能迫使一部分魚類嘗試游向淺灘、甚至探索陸地尋求生路，這股推力間接加速了脊椎動物登陸的進程。可以說，正是這場海洋的「窒息危機」，逼出了生命向陸地進軍的勇氣，讓我們遠古的祖先最終踏上了征服陸地的旅程。
                </span>
              </>
            )
          },
          {
            id: 'devonian',
            name: '泥盆紀 (Devonian)',
            englishName: 'Devonian',
            start: 419.2,
            end: 358.9,
            description: (
              <>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                  顯著生命的時代：從寒武紀到現代
                </span>
                <span className="block leading-relaxed mb-4">
                  「顯生宙」意為「可見的生命」，標誌著複雜多細胞生物大量繁衍的時期。從寒武紀大爆發開始，地球生命形式經歷了爆炸性的多樣化，無脊椎動物、魚類、兩棲類、爬行類、恐龍、鳥類與哺乳動物相繼登上歷史舞台。
                </span>
                <span className="block leading-relaxed">
                  這個時期包含了古生代、中生代與新生代，見證了多次生物大滅絕與復甦，也是植物登陸並覆蓋地表的關鍵時期。我們目前就生活在顯生宙的最後一刻。
                </span>
              </>
            ),
            image: 'Devonian.jpg',
            children: []
          },
          {
            id: 'silurian',
            name: '志留紀 (Silurian)',
            englishName: 'Silurian',
            start: 443.8,
            end: 419.2,
            description: (
              <>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                【志留紀：絕境逢生的登陸灘頭堡】
                </span>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                (The Silurian Period: The Beachhead of Resurrection and Landfall)
                </span>
                <span className="block leading-relaxed mb-4">
                如果說奧陶紀的結尾是一場將生命凍結的噩夢，那麼 4.4 億年前開啟的志留紀，就是地球從重症加護病房甦醒後的「復健與回暖」。隨著岡瓦納大陸的冰蓋融化，原本被鎖住的水分重新奔回海洋，讓海平面再次回升，溫暖的淺海重新覆蓋了大陸邊緣。但这时的地球並不安靜，板塊運動劇烈，大陸板塊像慢動作的碰碰車一樣撞在一起（加里東造山運動），隆起了巨大的山脈。這創造出了一個地貌複雜多變的世界：一邊是溫暖平靜的淺海珊瑚礁，另一邊是因碰撞而混濁、充滿沉積物的海灣。這種劇烈的地質活動，雖然讓環境變得不穩定，卻也攪動了營養物質，為倖存的海洋生物提供了豐富的「災後重建資金」。
                </span>
                <span className="block leading-relaxed">
                而志留紀最關鍵的環境遺產，並不在海裡，而是在頭頂那看不見的高空——「臭氧層防護罩」的正式啟用。在此之前，陸地就像是暴露在強烈紫外線下的「微波爐」，任何試圖登陸的生命都會被燒傷或破壞 DNA。但在志留紀，大氣中的氧氣濃度終於累積到足夠高，形成了一層厚實的臭氧層，有效地過濾了致命的紫外線。這個看不見的「防護罩」，將原本是生命禁區的陸地，變成了安全的「新大陸」。於是，在潮濕的水邊，第一批原始的維管束植物（如頂囊蕨）開始羞澀地探出頭來，將那原本只有紅褐色岩石的荒原，第一次染上了生命的綠意。如果沒有志留紀搭建的這個大氣屏障，地球的陸地可能至今仍是一片死寂的荒漠。
                </span>
              </>
            ),
            image: 'Silurian.jpg',
            children: []
          },
          {
            type: 'extinction',
            id: 'o_s_extinction',
            name: '第一次大滅絕 (O-S)',
            englishName: 'O-S Extinction',
            time: '443.8 Ma',
            image: 'O_S_Extinction.jpg',
            desc: (
              <>
                <span className="font-bold text-red-800 block mb-3 text-xl">
                【奧陶紀－志留紀滅絕：冰封樂園的殘酷洗禮】
                </span>
                <span className="font-bold text-red-800 block mb-3 text-xl">
                (Ordovician-Silurian Extinction: The Cruel Baptism of the Frozen Paradise)
                </span>
                <span className="block leading-relaxed mb-4">
                如果說後來的滅絕事件是毀滅性的「大火」，那麼發生在 4.45 億年前的奧陶紀末期滅絕，就是一場將生命凍結的「冰河陷阱」。當時的地球就像是一個溫暖的超大型水族箱，陸地上還是一片荒蕪，但海洋裡卻熱鬧非凡，三葉蟲、腕足動物和筆石正享受著廣闊淺海的「熱帶度假村」生活。然而，隨著巨大的岡瓦納大陸漂移到了南極，地球的恆溫系統突然崩潰了。大規模的冰河開始形成，鎖住了大量海水，導致全球海平面急劇下降。對於那些習慣住在溫暖淺海「舒適圈」的生物來說，這就像是家裡的屋頂突然被掀開，海水退去，原本溫暖的家園瞬間變成了乾涸或冰冷的荒原，導致約 85% 的物種在寒冷與棲地喪失的雙重打擊下徹底消失。
                </span>
                <span className="block leading-relaxed">
                但這場針對海洋生命的殘酷清洗，卻意外地成為了生命韌性的「極限壓力測試」。這場滅絕並非一次性的重擊，而是「先冰凍、後暖化」的雙重折磨——當冰河期結束，冰雪融化導致海平面暴漲，缺氧的海水又對倖存者進行了第二輪淘汰。然而，正是這種極端的環境篩選，淘汰了那些過度特化、適應力差的物種，留下了生命力最強韌的「通才」。這些倖存下來的浮游生物與早期脊椎動物（無頜魚類的祖先），在隨後的志留紀中展現了驚人的復原力。當海洋環境回穩，空蕩蕩的海洋再次成為演化的實驗室，為後來「魚類時代」的爆發奠定了基礎。這場災難證明了，即使將調節器轉到「冰點」，生命依然能找到存續的微光。
                </span>
              </>
            )
          },
          {
            id: 'ordovician',
            name: '奧陶紀 (Ordovician)',
            englishName: 'Ordovician',
            start: 485.4,
            end: 443.8,
            description: (
              <>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                【奧陶紀：全面啟動的水下大都會】
                </span>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                (The Ordovician Period: The Fully Activated Underwater Metropolis)
                </span>
                <span className="block leading-relaxed mb-4">
                如果說寒武紀是生命這場戲的「首映之夜」，那麼緊接而來的奧陶紀（距今約 4.85 億年），就是票房大賣後的「全面擴張期」。這時的地球是一個徹頭徹尾的「超級水世界」。由於氣候異常溫暖，兩極沒有冰帽，海平面上升到了古生代的最高點。海水不再只是輕拍海岸，而是大膽地入侵內陸，將原本廣闊的陸地變成了無數星羅棋布的淺海與群島。如果你當時能從外太空俯瞰地球，你會發現那標誌性的藍色幾乎佔據了所有視野，陸地反倒成了點綴其中的島嶼。這片無邊無際、陽光穿透的淺海，成為了孕育多樣性的超級溫床，其規模之大，是現代海洋完全無法比擬的。
                </span>
                <span className="block leading-relaxed">
                而在這片無限擴張的藍色領土中，生態系正經歷一場名為「奧陶紀生物大輻射」的**「城市化運動」。不同於寒武紀專注於發明奇怪的身體構造（創造新門類），奧陶紀的生物專注於將現有的設計發揚光大（增加物種數量）。海洋中第一次出現了真正的「立體建築」**——原始的珊瑚與層孔蟲開始堆疊，建造出地球上第一批礁岩，為無數生物提供了複雜的藏身處與公寓。同時，海水中微小的浮游生物爆發性增長，就像是建立了穩定的「糧食供應網」，支撐起更長、更複雜的食物鏈。如果說寒武紀搭建了生命的骨架，那麼正是奧陶紀這溫暖且廣闊的環境，為這具骨架填滿了豐富血肉，將海洋變成了一座熱鬧非凡、階級分明的水下大都會。
                </span>
              </>
            ),
            image: 'Ordovician.jpg',
            children: []
          },
          {
            id: 'cambrian',
            name: '寒武紀 (Cambrian)',
            englishName: 'Cambrian',
            start: 538.8,
            end: 485.4,
            description: (
              <>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                【寒武紀：生命首映的豪華水下劇場】
                </span>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                (The Cambrian Period: The Grand Underwater Theater of Life's Premiere)
                </span>
                <span className="block leading-relaxed mb-4">
                如果說後來的地質年代是熱鬧的叢林或草原，那麼 5.4 億年前的寒武紀，就像是一顆「表裡不一」的奇異星球。如果你當時站在陸地上，你會以為自己登陸了火星——放眼望去只有紅色的岩石與沙礫，沒有一棵樹、一根草，甚至聽不到一聲蟲鳴，死寂得令人發慌。但在這片荒涼的海岸線之外，情況卻截然不同。隨著前一代的超級大陸（羅迪尼亞大陸）崩解，陸塊分散漂移，導致全球海平面大幅上升，淹沒了沿海的低地。這在地球表面創造出了廣闊無邊、陽光充足且溫暖的「淺海大陸棚」。這些淺海就像是為了迎接生命而特製的「巨型恆溫培養皿」，陽光能直射海底，水溫舒適宜人，為生命的繁衍提供了最奢華的物理環境。
                </span>
                <span className="block leading-relaxed">
                而這個水下劇場不只提供了場地，還準備了關鍵的「道具與特效」。在寒武紀的海洋中，化學成分發生了劇變，海水中的鈣與碳酸根離子濃度達到飽和，這意味著生物第一次可以輕鬆地從水中提取材料來建造堅硬的骨骼與外殼。同時，大氣與海洋中的氧氣含量雖然不如今日，但也終於跨過了支持複雜運動的門檻。正是這種「溫暖淺海」加上「豐富原料」的環境組合，才讓生物有本錢去嘗試長出厚重的盔甲或耗能的大腦。如果沒有寒武紀這得天獨厚的地理與化學環境做後盾，就算生命有再強的演化動力，也無法在那場「大爆發」中上演如此精彩的變裝秀。
                </span>
              </>
            ),
            image: 'Cambrian.jpg',
            children: [
              {
                type: 'explosion',
                id: 'cambrian_explosion',
                name: '寒武紀大爆發 (生命綻放)',
                englishName: 'Cambrian Explosion',
                time: '~538.8 Ma',
                image: 'Cambrian_Explosion.jpg',
                // 修改 desc 如下：
                desc: (
                  <>
                    <span className="font-bold text-gray-900 block mb-4 text-xl">
                    【寒武紀大爆發：生命藍圖的創意大爆炸】
                    </span>
                    <span className="font-bold text-gray-900 block mb-4 text-xl">
                    (The Cambrian Explosion: The Big Bang of Biological Blueprints)
                    </span>
                    <span className="block leading-relaxed">
                    如果說之前的地球是令人昏昏欲睡的「靜默默劇」，那麼 5.4 億年前的寒武紀，就是一場突然上映的「4K 3D 動作大片」。在此之前，地球上的生命大多是趴在海床上、軟綿綿且構造簡單的生物（埃迪卡拉生物群），日子過得緩慢又和平。但就在地質學上一眨眼的瞬間，演化之神彷彿突然打開了「潘朵拉的盒子」，或是喝醉了酒開始瘋狂塗鴉。海洋中突然湧現了各式各樣長相怪異的生物：有的長了五隻眼睛，有的像是巨大的外星蝦子（如奇蝦），幾乎現今所有動物的主要「身體藍圖」（門）都在這短短的兩千萬年內全數登場。這不是循序漸進的改良，而是一次瘋狂的、爆發式的創意展覽。
                    </span>
                    <span className="block leading-relaxed">
                    這場演化狂歡的背後，其實是一場殘酷卻精彩的「軍備競賽」。科學家推測，可能是大氣含氧量的上升，或者是「眼睛」這個器官的發明，讓獵食者第一次「看見」了獵物。為了生存，生物們被迫開始武裝自己：有的長出了堅硬的甲殼（如三葉蟲）來防禦，有的演化出尖牙利齒來攻擊。這場「吃與被吃」的生存壓力，逼迫生命在短時間內演化出極其複雜的防禦與攻擊系統。我們今天所熟知的脊椎動物祖先，也是在這場混戰中卑微地誕生。如果沒有這場大爆發奠定了複雜生命的基礎架構，地球可能至今仍是一個只有微生物與軟體生物蠕動的寂寞星球。
                    </span>
                  </>
                )
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'proterozoic',
    name: '元古宙 (Proterozoic)',
    englishName: 'Proterozoic',
    start: 2500,
    end: 538.8,
    theme: 'rose',
    description: (
      <>
        <span className="font-bold text-gray-900 block mb-3 text-xl">
          顯著生命的時代：從寒武紀到現代
        </span>
        <span className="block leading-relaxed mb-4">
          「顯生宙」意為「可見的生命」，標誌著複雜多細胞生物大量繁衍的時期。從寒武紀大爆發開始，地球生命形式經歷了爆炸性的多樣化，無脊椎動物、魚類、兩棲類、爬行類、恐龍、鳥類與哺乳動物相繼登上歷史舞台。
        </span>
        <span className="block leading-relaxed">
          這個時期包含了古生代、中生代與新生代，見證了多次生物大滅絕與復甦，也是植物登陸並覆蓋地表的關鍵時期。我們目前就生活在顯生宙的最後一刻。
        </span>
      </>
    ),
    image: 'Proterozoic.jpg',
    children: []
  },
  {
    id: 'archean',
    name: '太古宙 (Archean)',
    englishName: 'Archean',
    start: 4000,
    end: 2500,
    theme: 'amber',
    description: (
      <>
        <span className="font-bold text-gray-900 block mb-3 text-xl">
          顯著生命的時代：從寒武紀到現代
        </span>
        <span className="block leading-relaxed mb-4">
          「顯生宙」意為「可見的生命」，標誌著複雜多細胞生物大量繁衍的時期。從寒武紀大爆發開始，地球生命形式經歷了爆炸性的多樣化，無脊椎動物、魚類、兩棲類、爬行類、恐龍、鳥類與哺乳動物相繼登上歷史舞台。
        </span>
        <span className="block leading-relaxed">
          這個時期包含了古生代、中生代與新生代，見證了多次生物大滅絕與復甦，也是植物登陸並覆蓋地表的關鍵時期。我們目前就生活在顯生宙的最後一刻。
        </span>
      </>
    ),
    image: 'Archean.jpg',
    children: []
  },
  {
    id: 'hadean',
    name: '冥古宙 (Hadean)',
    englishName: 'Hadean',
    start: 4600,
    end: 4000,
    theme: 'violet',
    description: (
      <>
        <span className="font-bold text-gray-900 block mb-3 text-xl">
          顯著生命的時代：從寒武紀到現代
        </span>
        <span className="block leading-relaxed mb-4">
          「顯生宙」意為「可見的生命」，標誌著複雜多細胞生物大量繁衍的時期。從寒武紀大爆發開始，地球生命形式經歷了爆炸性的多樣化，無脊椎動物、魚類、兩棲類、爬行類、恐龍、鳥類與哺乳動物相繼登上歷史舞台。
        </span>
        <span className="block leading-relaxed">
          這個時期包含了古生代、中生代與新生代，見證了多次生物大滅絕與復甦，也是植物登陸並覆蓋地表的關鍵時期。我們目前就生活在顯生宙的最後一刻。
        </span>
      </>
    ),
    image: 'Hadean.jpg',
    children: []
  }
];

// Helper: 遞迴尋找單位及其關係
const findUnitInfo = (targetId: string | undefined, list: GeologicalNode[], parent: GeologicalNode | null = null): { unit: GeologicalNode, parent: GeologicalNode | null, prev: GeologicalNode | null, next: GeologicalNode | null } | null => {
  if (!targetId) return null;
  
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (item.id === targetId) {
      return {
        unit: item,
        parent: parent,
        prev: list[i + 1] || null,
        next: list[i - 1] || null
      };
    }
    if (item.children) {
      const result = findUnitInfo(targetId, item.children, item);
      if (result) return result;
    }
  }
  return null;
};

const getNavigation = (targetId: string | undefined, list: GeologicalNode[]): NavInfo | null => {
  const info = findUnitInfo(targetId, list);
  if (!info) return null;
  const older = info.prev;
  const younger = info.next;
  return { ...info, olderSibling: older, youngerSibling: younger };
};

const SmartImage: React.FC<SmartImageProps> = ({ src, alt, className, fallbackColor, type }) => {
  const [error, setError] = useState(false);
  const imagePath = `/images/${src}`;

  if (error) {
    let Icon: React.ElementType = ImageIcon;
    if (type === 'extinction') Icon = AlertTriangle;
    if (type === 'explosion') Icon = Sparkles; 

    return (
      <div className={`flex items-center justify-center ${className} ${fallbackColor || 'bg-gray-200'} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black to-transparent"></div>
        <div className="text-center p-2 z-10 opacity-60">
           <Icon size={32} className="mx-auto mb-1 opacity-70" />
           <span className="text-[10px] font-mono block break-all">{src}</span>
           <span className="text-[10px] block text-xs">(圖片未找到)</span>
        </div>
      </div>
    );
  }

  return (
    <img 
      src={imagePath} 
      alt={alt} 
      className={`${className} object-cover`}
      onError={() => setError(true)}
    />
  );
};

const SpecialEventBar: React.FC<SpecialEventBarProps> = ({ data, onSelect, depth = 0 }) => {
  const isExplosion = data.type === 'explosion';
  
  const breakoutStyle: React.CSSProperties = isExplosion ? {
    marginLeft: `calc(-1 * (1.5rem + ${depth * 2}rem))`, 
    width: `calc(100% + (1.5rem + ${depth * 2}rem))`,
    zIndex: 20
  } : {};

  const styles = isExplosion ? {
    borderColor: 'border-yellow-400',
    borderWidth: 'border-l-8',
    fallbackBg: 'bg-yellow-500',
    gradient: 'from-yellow-600 via-yellow-500/80',
    titleColor: 'text-yellow-50',
    tagColor: 'text-yellow-200',
    tagText: 'MAJOR EVOLUTIONARY MILESTONE',
    icon: Sparkles,
    iconColor: 'text-yellow-200'
  } : {
    borderColor: 'border-red-600',
    borderWidth: 'border-l-4',
    fallbackBg: 'bg-red-900',
    gradient: 'from-red-950/90 via-red-900/70',
    titleColor: 'text-red-100',
    tagColor: 'text-red-300',
    tagText: 'MASS EXTINCTION',
    icon: AlertTriangle,
    iconColor: 'text-red-400'
  };

  const Icon = styles.icon;

  return (
    <div 
      className={`relative flex items-center my-4 cursor-pointer hover:scale-[1.01] transition-transform duration-200 group overflow-hidden rounded-r-lg shadow-lg h-28 ${styles.borderColor} ${styles.borderWidth} ${isExplosion ? 'rounded-l-none shadow-xl ring-1 ring-yellow-400/30' : 'rounded-l-lg'}`}
      style={breakoutStyle}
      onClick={(e) => { e.stopPropagation(); onSelect(data); }}
    >
      <div className="absolute inset-0 z-0">
        <SmartImage 
          src={data.image} 
          alt={data.name} 
          className="w-full h-full"
          fallbackColor={styles.fallbackBg}
          type={data.type}
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${styles.gradient} to-transparent`}></div>
        {isExplosion && <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,_var(--tw-gradient-stops))] from-yellow-400/20 to-transparent animate-pulse"></div>}
      </div>
      
      <div className="relative flex justify-between items-center w-full text-white z-10 px-6">
        <div>
           <div className="flex items-center gap-2 mb-1">
            <Icon size={20} className={`${styles.iconColor} ${isExplosion ? 'animate-spin-slow' : 'animate-pulse'}`} />
            <span className={`${styles.tagColor} font-bold text-xs tracking-widest uppercase border-b border-white/20 pb-0.5`}>{styles.tagText}</span>
           </div>
           <h3 className={`font-bold ${isExplosion ? 'text-3xl tracking-tight' : 'text-xl'} text-shadow-md text-white`}>{data.name}</h3>
           <p className={`text-sm ${styles.titleColor} mt-1 line-clamp-1 max-w-xl opacity-90 font-medium`}>{data.desc}</p>
        </div>
        <div className="flex flex-col items-end pl-4 border-l border-white/10">
          <span className={`font-mono ${isExplosion ? 'text-3xl' : 'text-2xl'} font-bold ${styles.tagColor}`}>{data.time}</span>
          {isExplosion && <span className="text-[10px] uppercase tracking-wider opacity-70">Beginning of Phanerozoic</span>}
        </div>
      </div>
    </div>
  );
};

const DetailPanel: React.FC<DetailPanelProps> = ({ unit, onClose, onNavigate }) => {
  if (!unit) return null;

  const isExtinction = unit.type === 'extinction';
  const isExplosion = unit.type === 'explosion';
  
  const navInfo = useMemo(() => getNavigation(unit.id, geologicalData), [unit.id]);
  
  let theme = unit.theme || (navInfo?.parent?.theme) || 'slate';
  let headerBg = 'bg-white';
  let headerBorder = 'border-gray-100';
  let titleColor = 'text-gray-900';
  let iconColor = 'text-blue-600';

  if (isExtinction) {
    headerBg = 'bg-red-50';
    headerBorder = 'border-red-100';
    titleColor = 'text-red-700';
    iconColor = 'text-red-600';
  } else if (isExplosion) {
    headerBg = 'bg-yellow-50';
    headerBorder = 'border-yellow-100';
    titleColor = 'text-yellow-700';
    iconColor = 'text-yellow-600';
  }

  const colors = getThemeLevelColors(theme, 1);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-7xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gray-100 border-b border-gray-200 p-2 flex justify-between items-center flex-shrink-0">
          <div className="flex gap-2">
            {navInfo?.parent ? (
               <button 
                 onClick={() => onNavigate(navInfo.parent!)}
                 className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
               >
                 <CornerUpLeft size={16} /> 上層: {navInfo.parent.name}
               </button>
            ) : (
              <span className="text-xs text-gray-400 px-3 py-1.5 flex items-center gap-1"><CornerUpLeft size={16}/> 無上層</span>
            )}
          </div>

          <div className="flex gap-2">
             <button 
               onClick={() => navInfo?.olderSibling && onNavigate(navInfo.olderSibling)}
               disabled={!navInfo?.olderSibling}
               className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
             >
               <ArrowLeft size={16} /> 更古老
             </button>
             
             <button 
               onClick={() => navInfo?.youngerSibling && onNavigate(navInfo.youngerSibling)}
               disabled={!navInfo?.youngerSibling}
               className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
             >
               更年輕 <ArrowRight size={16} />
             </button>
          </div>
          
          <button onClick={onClose} className="p-1.5 hover:bg-red-100 hover:text-red-600 rounded text-gray-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          <div className="w-full md:w-2/3 h-64 md:h-auto relative bg-gray-100 flex-shrink-0">
            <SmartImage 
              src={unit.image} 
              alt={unit.name} 
              className="w-full h-full"
              fallbackColor={colors.bg}
              type={unit.type}
            />
          </div>

          <div className="w-full md:w-1/3 flex flex-col h-full overflow-hidden bg-white">
            <div className={`p-6 border-b ${headerBg} ${headerBorder}`}>
              <div>
                  <h2 className={`text-3xl font-bold ${titleColor}`}>
                    {unit.name}
                  </h2>
                  <span className="font-mono text-sm text-gray-500">{unit.englishName}</span>
              </div>
              
              <div className={`flex items-center gap-2 font-mono font-semibold ${iconColor} mt-2`}>
                <Clock size={18} />
                {(isExtinction || isExplosion) ? (
                  <span>{unit.time}</span>
                ) : (
                  <span>{unit.start} Ma - {unit.end} Ma</span>
                )}
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BookOpen size={16}/> 
                  {(isExtinction || isExplosion) ? '事件描述' : '時期特徵'}
                </h3>
                <div className="text-gray-700 leading-relaxed text-lg max-h-[200px] overflow-y-auto pr-4">
                  {(isExtinction || isExplosion) ? unit.desc : (unit.description || "暫無詳細描述。")}
                </div>
              </div>

              {unit.children && unit.children.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">
                    下分層級 <span className="text-xs font-normal text-gray-400 normal-case ml-2">(點擊進入)</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {unit.children.map((child, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => onNavigate(child)}
                        className="group relative overflow-hidden rounded-lg border border-gray-200 hover:border-blue-400 hover:ring-2 hover:ring-blue-100 transition-all bg-white cursor-pointer hover:shadow-md"
                      >
                        <div className="flex h-20">
                           <div className="w-24 flex-shrink-0 bg-gray-100 relative">
                              <SmartImage 
                                src={child.image} 
                                alt={child.name} 
                                className="w-full h-full group-hover:scale-105 transition-transform"
                                fallbackColor={child.type === 'extinction' ? 'bg-red-100' : (child.type === 'explosion' ? 'bg-yellow-100' : 'bg-gray-200')}
                                type={child.type}
                              />
                           </div>
                           <div className="flex-1 p-3 flex flex-col justify-center">
                              <div className="flex justify-between items-start">
                                <span className={`font-bold flex items-center gap-1 ${child.type === 'extinction' ? 'text-red-700' : (child.type === 'explosion' ? 'text-yellow-700' : 'text-gray-800')} group-hover:text-blue-700`}>
                                  {child.name}
                                  {(child.type !== 'extinction' && child.type !== 'explosion') && <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                                </span>
                              </div>
                              <div className="flex justify-between items-center mt-1">
                                 <span className="text-xs text-gray-500 font-mono">
                                   {child.englishName}
                                 </span>
                                 <span className={`text-xs font-mono px-2 py-0.5 rounded ${child.type === 'extinction' ? 'text-red-600 bg-red-50' : (child.type === 'explosion' ? 'text-yellow-700 bg-yellow-50' : 'text-gray-400 bg-gray-50 group-hover:bg-blue-50 group-hover:text-blue-500')}`}>
                                   {(child.type === 'extinction' || child.type === 'explosion') ? child.time : `${child.start} Ma`}
                                 </span>
                              </div>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TimelineItem: React.FC<TimelineItemProps> = ({ data, depth = 0, onSelect, themeColor }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  if (data.type === 'extinction' || data.type === 'explosion') {
    return <SpecialEventBar data={data} onSelect={onSelect} depth={depth} />;
  }

  const currentTheme = data.theme || themeColor || 'slate';
  const colors = getThemeLevelColors(currentTheme, depth);
  const styles = getThemeStyles(currentTheme); // 取得樣式物件來使用 dashedBorder 和 line
  const hasChildren = data.children && data.children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(data);
  };

  return (
    <div className="mb-4">
      <div 
        className={`
          relative group flex overflow-hidden rounded-xl shadow-sm border transition-all cursor-pointer h-28 md:h-32
          ${colors.bg} ${colors.border} ${colors.hover} hover:shadow-md
        `}
        style={{ marginLeft: `${depth > 0 ? 1 : 0}rem` }}
        onClick={handleDetails}
      >
        <div className="w-1/3 md:w-48 flex-shrink-0 bg-gray-100 relative overflow-hidden">
          <SmartImage 
            src={data.image} 
            alt={data.name} 
            className="w-full h-full group-hover:scale-105 transition-transform duration-700"
            fallbackColor={`${colors.bg} opacity-50`}
          />
           {depth > 0 && (
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${styles.line}`}></div>
          )}
        </div>

        <div className="flex-1 p-4 flex flex-col justify-between relative">
          <div className="flex justify-between items-start">
             <div>
               <h3 className={`font-bold ${depth === 0 ? 'text-2xl' : 'text-xl'} ${colors.text} group-hover:opacity-80 transition-opacity`}>
                 {data.name}
               </h3>
               <span className={`text-sm opacity-60 font-mono ${colors.text}`}>{data.englishName}</span>
             </div>
             
             {hasChildren && (
              <button 
                onClick={handleToggle}
                className={`p-1 hover:bg-white/50 rounded-full transition-colors ${colors.text} opacity-60 hover:opacity-100 z-10`}
              >
                {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </button>
             )}
          </div>

          <div className="flex items-end justify-between mt-2">
             <div className="flex items-center gap-2 text-sm opacity-80 bg-white/40 px-2 py-1 rounded mix-blend-multiply">
               <Clock size={14} />
               <span className="font-mono font-medium">{data.start} Ma - {data.end} Ma</span>
             </div>
             <button className={`text-${currentTheme}-700 opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium flex items-center gap-1 bg-white/50 px-2 py-1 rounded-full`}>
               查看詳情 <ChevronRight size={14}/>
             </button>
          </div>
        </div>
      </div>

      <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[20000px] opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        {hasChildren && (
          <div className={`mt-2 pl-2 md:pl-4 border-l-2 border-dashed ${styles.dashedBorder} ml-4 md:ml-6`}>
            {data.children!.map((child, index) => (
              <TimelineItem 
                key={index} 
                data={child} 
                depth={depth + 1} 
                onSelect={onSelect} 
                themeColor={currentTheme} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [selectedUnit, setSelectedUnit] = useState<GeologicalNode | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900 pb-20">
      <div className="bg-slate-900 text-white pt-10 pb-24 px-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-10 opacity-10">
            <Clock size={200} />
         </div>
         <div className="max-w-5xl mx-auto relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">地球歷史畫廊</h1>
            <p className="text-xl text-slate-300 max-w-2xl">
              探索 46 億年的地質演變。
              <span className="block mt-2 text-sm text-slate-400 border-l-2 border-yellow-500 pl-3">
                點擊卡片查看詳情，或展開層級探索子時代。
              </span>
            </p>
         </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 -mt-16 relative z-20">
        <div className="space-y-2">
          {geologicalData.map((eon, index) => (
            <TimelineItem 
              key={index} 
              data={eon} 
              onSelect={setSelectedUnit} 
            />
          ))}
        </div>
        
        <div className="text-center text-gray-400 text-sm mt-12 mb-8">
          Created for Educational Purposes • Data from ICS 2024
        </div>
      </main>

      {selectedUnit && (
        <DetailPanel 
          unit={selectedUnit} 
          onClose={() => setSelectedUnit(null)} 
          onNavigate={setSelectedUnit}
        />
      )}
    </div>
  );
}