import React, { useState, useMemo, useEffect } from 'react';
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
  Sparkles,
  Layers, 
  X
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
  objectFit?: 'cover' | 'contain'; 
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
                【顯生宙：生命顯形的宏大舞台】
                </span>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                (The Phanerozoic Eon: The Grand Stage where Life Became Visible)
                </span>
                <span className="block leading-relaxed mb-4">
                由來：Phaneros (可見/顯著) + Zoe (生命)，意指「肉眼可見的生命」。由美國地質學家喬治•查德維克（George Halcott Chadwick，1876~1953）在1930年提出[1][2]。當時因為化石記錄和考古年代測定技術的限制，學術界普遍認為地球上的生命全部是在寒武紀大爆發中才開始「顯現」，因而得名。
                </span>
                <span className="block leading-relaxed mb-4">
                如果說前寒武紀是地球漫長而沈悶的「黑白默片」，那麼 5.41 億年前開啟的顯生宙，就是一場色彩斑斕、音效震撼的「4K 全彩史詩電影」。「顯生」（Phanerozoic）意為「可見的生命」，這標誌著地球終於告別了肉眼看不見的微生物時代，迎來了複雜生命的爆發。這一切始於寒武紀海洋中的一場「骨骼革命」，生物學會了利用礦物質製造硬殼與脊椎，從此在化石紀錄中留下了清晰的痕跡。隨後，生命不再滿足於海洋，而是發起了史上最偉大的「登陸諾曼第」——綠色植物率先染綠了荒蕪的岩石，昆蟲與兩棲類緊隨其後。在顯生宙的推動下，地球從一顆死寂的紅灰色岩石行星，轉變成了一顆藍綠交織、充滿呼吸與心跳的「活體星球」。
                </span>
                <span className="block leading-relaxed">
                然而，這部史詩並非只有喜劇，它更是一部充滿血淚的「災難求生錄」。在顯生宙的三大章節（古生代、中生代、新生代）中，地球經歷了五次毀滅性的大滅絕，每一次都將生命逼入絕境，卻又奇蹟似地觸發了更強大的演化反彈。我們見證了霸權的頻繁更迭：從古生代的三葉蟲與巨型昆蟲，到中生代的恐龍帝國，再到新生代的哺乳類與人類崛起。大陸板塊在這個宙裡分分合合，從羅迪尼亞的分裂到盤古大陸的聚合再裂解，地理的變遷不斷重塑著氣候與生態。顯生宙的故事告訴我們，生命並非靜態的存活，而是一場在動盪中不斷試錯、不斷複雜化的「反脆弱」旅程，最終演化出了能回頭去閱讀這部歷史的智慧生命—我們。
                </span>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                【科學家的悄悄話】
                </span>
                <span className="block leading-relaxed mb-4">
                「這是一個關於『存在感』的定義。顯生宙這個名字提醒我們：生命不再是躲在顯微鏡下的微塵，而是成為了能夠改變大氣成分、改造地表地貌的『地質力量』。這 5 億年證明了，生命不只是地球的乘客，更是這艘太空船的駕駛員。」
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
            <span className="font-bold text-red-800 block mb-3 text-xl">
            【全新世滅絕：智人的獨角戲與燃燒的圖書館】
            </span>
            <span className="font-bold text-red-800 block mb-3 text-xl">
            (The Holocene Extinction: The Soliloquy of Sapiens and the Burning Library)
            </span>
            <span className="block leading-relaxed mb-4">
            如果說白堊紀末期的滅絕是一場來自外太空的「瞬間處決」，那麼發生在全新世（特別是工業革命後）的這場「第六次大滅絕」，就是一場由人類導演的「漫長凌遲」。這一次，地球不需要直徑 10 公里的小行星，也不需要噴發百萬年的超級火山，它只需要一種名為「智人」的生物。隨著人類人口呈指數級增長，我們對資源的掠奪超越了自然的再生能力。我們將森林夷為平地改種單一作物，將河流截斷用於發電，將海洋變成了塑膠湯。這導致物種滅絕的速率比背景值高出了 100 到 1000 倍。這是一場「無聲的屠殺」，許多物種（如某些兩棲類或昆蟲）甚至還沒來得及被人類命名，就已經永遠消失在推土機的轟鳴聲中。
            </span>
            <span className="block leading-relaxed">
            這場滅絕最可怕的地方在於其「系統性破壞」。過去的災難通常是物理性的（如降溫、撞擊），而這次是我們從根本上拆解了生態網。我們透過全球貿易將入侵物種帶到它們不該去的地方，導致當地原生種崩潰；我們排放的二氧化碳不僅改變了氣候，還讓海洋酸化，正在殺死海洋生態的基石——珊瑚礁。知名生物學家威爾森（E.O. Wilson）將其形容為「燒毀生命的圖書館」。這一次，我們不僅是災難的受害者，更是災難的製造者。渡渡鳥、旅鴿、袋狼的消失只是冰山一角，真正的危機在於支撐人類文明的生物多樣性（如授粉昆蟲、土壤微生物）正在崩解。如果不踩煞車，全新世最終可能成為地質史上最短命、也最寂靜的一個時代。
            </span>
            <span className="font-bold text-red-800 block mb-3 text-xl">
            【科學家的悄悄話】
            </span>
            <span className="block leading-relaxed mb-4">
            「這是一個關於『兇手與救世主』的悖論。這是地球 46 億年來，第一次由某個物種（我們）單獨引發的大滅絕。但與那顆撞死恐龍的小行星不同，小行星沒有選擇，而我們有。我們是唯一能意識到自己在做什麼，並擁有停止這場災難能力的生物。」
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
            由來：「越來越新」系列—希臘文的比較級遊戲。新生代的命名邏輯變了。地質學家萊爾（Charles Lyell）為了區分地層的年輕程度，用希臘文的後綴來表示「現代物種（貝類）在化石中的比例」。字根 -cene 來自希臘文 Kainos (新)。
            </span>
            <span className="block leading-relaxed mb-4">
            如果說中生代是一場狂熱的「夏日派對」，那麼距今 6600 萬年開啟的新生代，就是派對結束後，地球逐漸將空調溫度調低的「冷靜期」。在恐龍滅絕後的初期，地球依然相當溫暖，但隨著時間推移，一場劇烈的地質運動改變了一切：印度板塊像一輛失控的卡車狠狠撞向歐亞大陸，隆起了雄偉的喜馬拉雅山脈 。這場造山運動加速了岩石風化，大量消耗了大氣中的二氧化碳，導致全球氣溫開始一路下滑。原本覆蓋全球的茂密雨林開始退縮，取而代之的是更加開闊、乾燥且耐寒的「草原生態系」。地球的地貌從單一的綠色叢林，變成了四季分明、冰雪與草原交織的複雜世界，這種環境的劇變迫使生命必須學會適應寒冷與長途遷徙。
            </span>
            <span className="block leading-relaxed">
            在這個逐漸變冷且視野開闊的新舞台上，生命上演了一場名為「小卒變英雄」的勵志劇。那些曾經在恐龍腳下瑟瑟發抖、體型如老鼠般的哺乳動物，迅速填補了恐龍留下的真空。牠們不再只是躲在地洞裡，而是大膽地走向海洋（演化成鯨魚）、飛向天空（演化成蝙蝠），並奔馳在廣闊的草原上。為了適應草原生活，動物們演化出了更修長的腿（為了逃跑或追捕）和更複雜的社會行為。更有趣的是，草原的出現推動了一種特殊的演化壓力——在沒有樹木遮蔽的開闊地上，「腦力」變得比蠻力更重要。正是在這種環境下，靈長類動物開始直立行走，解放雙手，並最終點燃了智慧的火花。新生代不只是哺乳類的時代，更是智慧生命在嚴酷氣候中磨練成形的關鍵篇章。
            </span>
            <span className="font-bold text-gray-900 block mb-3 text-xl">
                【科學家的悄悄話】
                </span>
                <span className="block leading-relaxed mb-4">
                「這是一個關於『逆境出人才』的故事。新生代的降溫趨勢雖然嚴酷，但正是這種寒冷與多變的氣候，逼迫生命演化出恆溫系統與更大的大腦。它告訴我們：舒適的環境適合生存，但唯有充滿挑戰的變局，才能孕育出真正的智慧。」
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
                【第四紀：冰封輪迴與人類登基的最終章】
                </span>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                (The Quaternary Period: The Glacial Cycles and the Final Chapter of Human Coronation)
                </span>
                <span className="block leading-relaxed mb-4">
                由來：這是一個歷史遺留名詞。早期的地質學家把地球岩石分為四類：第一紀（已廢棄）、第二紀（已廢棄）、第三紀（Tertiary，曾用來指古近紀+新近紀，現已逐漸廢棄）、第四紀。只有「第四紀」這個名字因為太好用（代表人出現之後的時代）被保留了下來。
                </span>
                <span className="block leading-relaxed mb-4">
                如果說新近紀是地球逐漸變冷的「前奏曲」，那麼距今 258 萬年前開啟的第四紀，就是樂章進入了最激昂、節奏最快的「變奏震盪期」。這個時期的地球就像是一台接觸不良的冰箱，不斷在「極凍模式」（冰期）與「解凍模式」（間冰期）之間劇烈切換。這種前所未有的氣候脈動，重塑了地球的表面——巨大的冰原像推土機一樣反覆輾過北半球，切削出峽灣與湖泊（如五大湖），並透過海平面的升降，時而將大陸連接起來（陸橋），時而又將它們隔絕成島嶼。這是一個「邊界不斷流動」的時代，劇變的環境迫使生態系必須保持高度的彈性，無法適應快速變化的物種（如許多特化的森林古獸）迅速被淘汰。
                </span>
                <span className="block leading-relaxed">
                在這個以「不穩定」為常態的舞台上，演化上演了一場「智力與耐力」的對決。第四紀是著名的「巨型動物群」（如長毛象、披毛犀）與「人屬生物」（Homo）共同活躍的時代。早期的寒冷濾網篩選出了體型巨大、披著長毛的獸類來統治冰原；然而，隨著氣候反覆震盪，一種不靠皮毛而靠「大腦與工具」的靈長類——人類，展現了驚人的適應力。我們利用冰期時的低水位跨越大陸，利用間冰期時的溫暖發展農業。第四紀的故事主軸，就是看一個物種（人類）如何從食物鏈的中層，趁著氣候的混亂崛起，最終在最近的一次溫暖間歇期（全新世）中，取代了氣候與地質力量，成為塑造地球面貌的新主宰。
                </span>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                【科學家的悄悄話】
                </span>
                <span className="block leading-relaxed mb-4">
                「為什麼還要分出一個第四紀？從地質時間尺度來看，這 200 多萬年短得像一眨眼。但它被獨立出來有兩個原因：第一，這是地球這 5 億年來最寒冷、氣候跳動最劇烈的時期；第二，這是有史以來第一次，『智慧』（人類）這種演化特徵成為了地質紀錄中不可忽視的力量。」
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
                     【全新世：文明萌芽的黃金恆溫窗】
                     </span>
                     <span className="font-bold text-gray-900 block mb-3 text-xl">
                     (The Holocene Epoch: The Golden Thermal Window of Budding Civilizations)
                     </span>
                     <span className="block leading-relaxed mb-4">
                     由來：Holos (完全/全部) + Cene (新)。「完全」的新時期（就是現在）。
                     </span>
                     <span className="block leading-relaxed mb-4">
                     如果說更新世是一場忽冷忽熱的「氣候雲霄飛車」，那麼 11,700 年前開啟的全新世，就是雲霄飛車終於停靠在月台後的「寧靜時刻」。隨著最後一次冰期結束，全球氣溫回暖並驚人地維持在一種「異常穩定」的狀態。那些曾經覆蓋北半球的巨大冰蓋融化，融水導致海平面上升，淹沒了白令陸橋與古海岸線，將世界地圖定格成了我們今天熟悉的模樣——各大洲被海洋隔開，形成了現代的島嶼與海峽。 這種穩定的氣候就像是為地球按下了一個「恆溫鍵」，季節變化變得規律且可預測。原本為了躲避寒風而不斷遷徙的人類祖先，第一次發現他們可以信任明年的天氣，這種信任感成為了這顆星球上最偉大變革的基石。
                      </span>
                      <span className="block leading-relaxed">
                      在這個溫暖且可預測的「黃金窗口」期，人類不再是被動適應環境的流浪者，而是變成了「生態系工程師」。因為氣候穩定，我們敢於將種子埋入土裡（農業革命），馴化了原本野性的狼與牛羊，並在肥沃的河流三角洲建立了永久的城市。這是一個「自然退位，人類登基」的時代。在短短的一萬年內——這在地質時鐘上連一秒都不到——我們將森林變成了農田，將荒原變成了都市，將地下的碳（化石燃料）抽出來排放到大氣中。全新世雖然是地質史上最短暫的一個篇章，但它對地球外貌的改變速度，卻超過了過去數百萬年的總和。我們不再是住在地球上的房客，而是成為了能夠手動調節地球恆溫器的管理者。
                     </span>
                     <span className="font-bold text-gray-900 block mb-3 text-xl">
                     【科學家的悄悄話】
                     </span>
                     <span className="block leading-relaxed mb-4">
                     「這是一個關於『幸運與責任』的警鐘。全新世告訴我們：文明的誕生並非必然，而是建立在一段長達一萬年的氣候『甜蜜點』（Sweet Spot）之上。我們是這段平靜時光的受益者，但現在，我們似乎正在親手打破這份得來不易的平衡。」
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
                    【更新世：冰封輪迴的獵殺戰場】
                     </span>
                     <span className="font-bold text-gray-900 block mb-3 text-xl">
                     (The Pleistocene Epoch: The Glacial Cycles and the Killing Fields of the Ice Age)
                     </span>
                     <span className="block leading-relaxed mb-4">
                     由來：Pleistos (最多) + Cene (新)。「最多」的新時期（絕大多數都是現代物種了）。
                     </span>
                     <span className="block leading-relaxed mb-4">
                     如果說之前的時代是地球氣候的「單向演變」，那麼 258 萬年前開啟的更新世，就是地球陷入了一種瘋狂的「忽冷忽熱循環模式」。受地球軌道變化（米蘭科維奇循環）的影響，巨大的冰蓋像呼吸一樣，在北半球反覆擴張與退縮了數十次。最冷的時候，地球 30% 的陸地被數公里厚的冰層覆蓋，海平面下降了 100 多公尺。這看似災難，卻意外地為生命搭建了最重要的「全球高速公路」：下降的海水位讓大陸棚裸露出來，白令海峽變成了「白令陸橋」（Beringia），將亞洲與美洲連為一體；印尼群島連成了「巽他古陸」。 這是一個寒冷但邊界消失的世界，只要你耐得住凍，你就可以徒步走到地球的任何角落。
                      </span>
                      <span className="block leading-relaxed">
                      在這個寒風刺骨的白色舞台上，生命演化出了兩支截然不同的隊伍：一支是將「保暖裝備」點滿的「巨型動物群」（Megafauna），如長毛象、披毛犀與劍齒虎，牠們身披厚毛、體型巨大，是當時當之無愧的冰原坦克；另一支則是看似孱弱、沒有尖牙利爪，卻掌握了「外掛」（火與工具）的直立猿猴——人類。 更新世的殘酷環境逼迫我們的祖先（直立人、尼安德塔人、智人）大腦飛速升級。我們學會了用火驅散寒冷，用縫紉製作獸皮衣物，用複雜的語言協同狩獵。這是一場不對稱的戰爭：雖然長毛象擁有絕對的力量，但人類擁有適應變化的智慧。最終，隨著更新世末期氣候轉暖與人類狩獵技術的精進，那些曾經不可一世的巨獸紛紛倒下，人類踩著冰原巨獸的腳印，正式登上了食物鏈的頂端。
                     </span>
                     <span className="font-bold text-gray-900 block mb-3 text-xl">
                     【科學家的悄悄話】
                     </span>
                     <span className="block leading-relaxed mb-4">
                     「這是一個關於『壓力測試』的證明。更新世告訴我們：人類並不是在溫室裡長大的花朵，而是在冰河世紀的反覆折磨中鍛造出來的戰士。是寒冷教會了我們合作，是多變的環境逼出了我們的智慧。」
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
               【新近紀：現代面貌的重塑與草原帝國的崛起】
                </span>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                (The Neogene Period: The Reshaping of Modern Facade and the Rise of Grassland Empires)
                </span>
                <span className="block leading-relaxed mb-4">
                由來：「新」是neo-的意譯，「近」則是-gene的音譯，兼顧了字面意義。
                </span>
                <span className="block leading-relaxed mb-4">
                如果說古近紀是地球的一場「復古熱帶派對」，那麼距今 2,300 萬年到 258 萬年前的新近紀，就是派對散場後，地球開始進行嚴肅裝修的「現代化工程」。這個時期的主旋律是「乾燥與變冷」。隨著喜馬拉雅山與安地斯山脈的劇烈隆起，大氣環流被阻斷，昔日覆蓋全球的溫暖雨林被迫退守赤道。取而代之的是一種更強勢、更耐旱的霸主——「禾本科植物」（草）。這股綠色浪潮席捲了所有大陸，創造出了前所未有的廣闊「疏林草原」。這種地貌的改變迫使生物界進行了一次徹底的「系統更新」：森林裡的古老獸類退場，演化出了擅長奔跑的馬、長著複雜牙齒的食草動物，以及為了適應開闊地而嘗試直立行走的靈長類。我們今天在動物園看到的獅子、大象、斑馬等「現代動物群」，基本上都是在這個時期定型的。
                </span>
                <span className="block leading-relaxed">
                為什麼地質學家要將中新世與上新世合併為一個「紀」？因為這兩者共同構成了一個連貫的「趨冷章節」，與之前的溫室地球（古近紀）截然不同。在新近紀，地球完成了最後的地理拼圖：南北美洲透過巴拿馬地峽相連，地中海一度乾涸又注水，洋流系統被重塑為現代模式。這是一段「承上啟下」的關鍵時光——它一方面承接了古近紀的哺乳類繁榮，另一方面則透過持續的降溫，一步步為後來殘酷的「冰河世紀」（第四紀）鋪平了道路。如果沒有新近紀這兩千萬年的「草原化」與「冷卻化」做鋪墊，人類的祖先就不會被迫走出森林，地球也不會變成今天這個四季分明、冰雪與綠地共存的世界。
                </span>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                【科學家的悄悄話】
                </span>
                <span className="block leading-relaxed mb-4">
                「為什麼叫『新』近紀？這其實是與之前的『古』近紀做對比。古近紀（Paleogene）的生物雖然已經是哺乳類，但長得還很原始（古老）；而到了新近紀（Neogene），生物的面貌已經『煥然一新』，無論是植物（草）還是動物（類人猿、現代哺乳類），都已經與現代物種非常接近。這是一條從『古老』走向『現代』的分水嶺。」
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
                    【上新世：南北合體的寒冷前奏與直立元年】
                    </span>
                    <span className="font-bold text-gray-900 block mb-3 text-xl">
                    (The Pliocene Epoch: The Cold Prelude of Unified Americas and the Year One of Upright Walking)
                    </span>
                    <span className="block leading-relaxed mb-4">
                    由來：Pleion (更多) + Cene (新)。「更多」的新時期（現代物種變多了）。
                    </span>
                    <span className="block leading-relaxed mb-4">
                    如果說中新世是廣闊草原的鋪墊，那麼 533 萬年前開啟的上新世，就是地球地理格局完成最後拼圖的「造橋時刻」。這個時期最震撼的地質事件，莫過於「巴拿馬地峽」的升起——原本分開的南美洲與北美洲終於「牽手」成功。這座地質橋樑的連通，引發了史詩般的「南北美洲生物大遷徙」（Great American Interchange）：北方的熊與劍齒虎南下屠殺，南方的巨大地懶與犰狳北上探險。然而，這座陸橋更深遠的影響在於它切斷了熱帶洋流，迫使溫暖的墨西哥灣流轉向北大西洋，帶去了大量水氣。這些水氣在高緯度地區凝結成雪，導致格陵蘭冰蓋開始形成，地球的空調被正式鎖定在「製冷模式」，為即將到來的冰河時期做好了物理準備。
                    </span>
                    <span className="block leading-relaxed">
                    而在地球的另一端——東非大裂谷，氣候的變乾變冷上演了一場悲壯的「生存強迫劇」。隨著森林破碎化，樹與樹之間的距離變得太遠，曾經住在樹上的古猿面臨了生死的抉擇。為了跨越危險的草原尋找食物，或者為了在烈日下減少陽光曝曬面積，我們著名的祖先——「南方古猿」（如「露西」） 終於做出了演化史上最大膽的決定：「站起來」。雙足行走不僅解放了雙手來使用工具與攜帶食物，更抬高了視野以警惕草原上的掠食者。上新世的地球雖然寒風漸起，但在那片金黃色的枯草中，直立行走的靈長類邁出了通往智慧文明的第一步。
                    </span>
                    <span className="font-bold text-gray-900 block mb-3 text-xl">
                    【科學家的悄悄話】
                    </span>
                    <span className="block leading-relaxed">
                    「這是一個關於『蝴蝶效應』的極致展現。上新世告訴我們：僅僅是因為美洲中間長出了一條細細的陸橋（巴拿馬），就改變了全球洋流，進而凍結了北極，並間接逼迫非洲的猿猴站起來走路。地理決定了氣候，而氣候塑造了我們。」
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
                    【中新世：草原帝國與猿類的黃金年代】
                    </span>
                    <span className="font-bold text-gray-900 block mb-3 text-xl">
                    (The Miocene Epoch: The Empire of Grasslands and the Golden Age of Apes)
                    </span>
                    <span className="block leading-relaxed mb-4">
                    由來：Meion (較少) + Cene (新)。「較少」的新時期（比現代少，但比之前多）。
                    </span>
                    <span className="block leading-relaxed mb-4">
                    如果說漸新世是森林退縮的序曲，那麼 2,300 萬年前開啟的中新世，就是地球正式被「綠色海洋」淹沒的時代。這裡說的不是海水，而是席捲全球的「禾本科植物」（草）。隨著氣候進一步變得乾燥與季節性分明，茂密的森林再也無法維持統治，取而代之的是一望無際、隨風起伏的「疏林草原」（Savanna）。 這看似簡單的景觀改變，實則是對動物界的一場殘酷考驗。草雖然豐富，但含有堅硬的「矽質體」，吃它就像在咀嚼砂紙。這迫使草食動物進行了一場牙齒與消化系統的「軍備競賽」——馬的牙齒變得更長更耐磨，體型也為了在開闊地上逃跑而變得更大、腿更長。這是一個視野開闊、塵土飛揚，充滿了奔跑與追逐的新世界。
                    </span>
                    <span className="block leading-relaxed">
                    就在這片草原擴張的同時，森林裡也上演著一場熱鬧的演化大戲。中新世被稱為「猿類的星球」，當時的地球上生活著多達 100 種以上的古猿（如原康修爾猿、西瓦古猿），種類比現在多得多，分佈範圍從非洲一路延伸到歐洲與亞洲。 此外，海洋生態系也迎來了巨變，隨著洋流的變冷，營養鹽上湧，滋養了巨大的「巨藻森林」，這為海洋巨獸提供了能量，地球史上最大的肉食魚類——「巨齒鯊」（Megalodon）正是在這時巡弋於大洋之中，獵食著新演化出來的鯨魚。中新世是一個陸地與海洋都充滿活力、巨獸與古猿並存的繁華時代，現代生態系的所有主要角色，幾乎都已經在此刻登上了舞台。
                    </span>
                    <span className="font-bold text-gray-900 block mb-3 text-xl">
                    【科學家的悄悄話】
                    </span>
                    <span className="block leading-relaxed">
                    「這是一個關於『被動進步』的故事。中新世告訴我們：草是地球上最強大的『設計師』。正是因為草原本質上的『難吃』與『開闊』，才逼出了馬的奔跑速度，也間接迫使躲在殘存森林裡的猿類，開始思考下地行走的可能性。」
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
            description: (
              <>
               <span className="font-bold text-gray-900 block mb-3 text-xl">
               【古近紀：哺乳類瘋狂實驗的熱帶溫室】
                </span>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                (The Paleogene Period: The Tropical Greenhouse of Mammalian Wild Experiments)
                </span>
                <span className="block leading-relaxed mb-4">
                由來：「古」是paleo-的意譯，「近」則是-gene的音譯，兼顧了字面意義。
                </span>
                <span className="block leading-relaxed mb-4">
                如果說 K-Pg 大滅絕是一次將電腦強制關機的黑畫面，那麼 6600 萬年前開啟的古近紀，就是系統重啟後運作過熱的「超級運算期」。你可能以為恐龍死後地球會一直冷冰冰，錯了！在經歷了短暫的核子冬天後，地球氣候發生了報復性的反彈，甚至一度飆升至比現在高十幾度的「極熱極大值」（PETM）。當時的地球就像是一個悶熱潮濕的「全球植物園」，連南極洲都長滿了棕櫚樹與鱷魚，兩極完全沒有冰雪。 這種極致的溫室環境，雖然讓海平面居高不下，但也創造了無比豐富的食物來源，茂密的雨林幾乎覆蓋了每一寸陸地，為那些剛從地洞裡鑽出來的倖存者們，準備好了最豐盛的自助餐。
                </span>
                <span className="block leading-relaxed">
                在這個沒有恐龍壓制的「權力真空期」，哺乳動物上演了一場演化史上最瘋狂的「變形記」。牠們不再滿足於當夜行性的小老鼠，而是開始大膽嘗試各種奇怪的體型與生存策略。有的嘗試巨大化（如怪異的猶因他獸），試圖成為新的坦克；有的決定逆向操作，重新回到海洋（如陸行鯨），最終變成了今天的鯨魚；還有一群巨型的「恐鳥」（Terror Birds） 短暫地接管了頂級掠食者的位置，模仿恐龍曾經的威風。這是一個「演化無政府狀態」的時代，大自然像是一個喝醉的設計師，隨意地將爪子、牙齒與蹄子組合在一起，試圖找出恐龍之後的最佳生存方案。所有的現代哺乳動物類群——包括我們的靈長類祖先，都是在這個混亂而充滿活力的溫室裡摸索出了最初的模樣。
                </span>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                【科學家的悄悄話】
                </span>
                <span className="block leading-relaxed mb-4">
                「這是一個關於『機會主義』的展示。古近紀告訴我們：當舊的霸主倒下，演化的速度會快得驚人。這不是循規蹈矩的進步，而是一場誰能最快搶佔地盤、誰敢嘗試最瘋狂生活方式（如重返海洋）的賭局。」
                </span>
              </>
            ),
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
                    【漸新世：南極冰封與巨獸的寒冷長征】
                    </span>
                    <span className="font-bold text-gray-900 block mb-3 text-xl">
                    (The Oligocene Epoch: The Antarctic Freeze and the Cold March of Giants)
                    </span>
                    <span className="block leading-relaxed mb-4">
                    由來：Oligos (少) + Cene (新)。「少數」的新時期（現代物種佔少數）。
                    </span>
                    <span className="block leading-relaxed mb-4">
                    如果說始新世是地球發燒的「熱帶桑拿」，那麼 3,390 萬年前開啟的漸新世，就是一場突如其來的「冰桶挑戰」。這一切的導火線源於南半球的一次地質分手：南美洲終於徹底斷開了與南極洲的最後連結，導致「德雷克海峽」（Drake Passage）被打通。這讓強勁的「南極繞極流」得以形成，它像一道冰冷的結界，將南極洲孤立在冷氣團中，導致地球南端覆蓋上了第一層永久性的厚重冰蓋。 這台天然的「巨型冷氣機」啟動後，全球氣溫驟降，海平面大幅退縮。曾經覆蓋全球的茂密雨林被迫撤退回赤道附近，取而代之的是溫帶落葉林與更加開闊、乾燥的「疏林草原」。地球的色調從深綠變成了褐黃，季節變得更加分明，原本唾手可得的食物變得稀缺且堅硬。
                    </span>
                    <span className="block leading-relaxed">
                    面對這場名為「大置換」（Grande Coupure）的氣候劇變，許多依賴柔嫩樹葉的原始哺乳類黯然退場，而留下來的倖存者則選擇了「巨大化」作為禦寒策略。漸新世是陸地史上最大哺乳動物登場的舞台，例如重達 20 噸、身高如長頸鹿般的「巨犀」（Paraceratherium）。 根據伯格曼法則（Bergmann's rule），巨大的體型有助於在寒冷中保持體溫，同時也能讓牠們夠到高處的樹葉，或在日益開闊的平原上進行長途遷徙以尋找食物。此外，隨著森林變稀疏，動物們不再能輕易躲藏，這促使食草動物演化出了更長的腿以便奔跑，而獵食者（如早期的劍齒虎類）也必須升級牠們的武裝。漸新世是一個「硬碰硬」的時代，生命不再是享受豐饒，而是學會了忍耐與長征。
                    </span>
                    <span className="font-bold text-gray-900 block mb-3 text-xl">
                    【科學家的悄悄話】
                    </span>
                    <span className="block leading-relaxed">
                    「這是一個關於『界線』的故事。漸新世的寒冷劃清了現代氣候的格局。它告訴我們：當洋流改變，整顆星球的命運就會隨之翻轉。南極的每一塊冰，都是從這時候開始，決定了地球未來三千萬年的氣候脈搏。」
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
                    【始新世：極熱雨林中的哺乳盛世】
                    </span>
                    <span className="font-bold text-gray-900 block mb-3 text-xl">
                    (The Eocene Epoch: The Mammalian Golden Age in the Hyper-Thermal Rainforest)
                    </span>
                    <span className="block leading-relaxed mb-4">
                    由來：Eos (黎明) + Cene (新)。「黎明般」的新時期（現代物種初現曙光）。
                    </span>
                    <span className="block leading-relaxed mb-4">
                    如果說古新世是災後的「創傷復原室」，那麼 5,600 萬年前開啟的始新世，就是地球把恆溫器轉到爆表的「極限桑拿房」。這一切始於一場神秘的碳排放事件（PETM，古新世—始新世極熱事件），大氣中的溫室氣體激增，導致全球氣溫飆升至現代無法想像的高度。這時的地球是一個真正的「無冰世界」：從赤道到北極，地表完全被茂密的熱帶雨林覆蓋。如果你當時站在南極洲，你看到的不是冰雪，而是搖曳的棕櫚樹和像河馬一樣的動物在溫暖的沼澤中打滾。 這是一個濕熱、擁擠且能量過剩的綠色迷宮，高溫加速了植物的生長，也為動物提供了源源不絕的食物動力，將地球推向了生物多樣性的高峰。
                    </span>
                    <span className="block leading-relaxed">
                    而在這個濕熱的綠色迷宮中，哺乳動物終於結束了古新世的「盲目摸索」，開始展現出「現代化」的雛形。雖然恐龍剛滅絕時的怪獸依然存在，但真正的主角是那些我們熟悉的動物祖先：第一匹像狐狸一樣大的「始祖馬」在林間穿梭，最早的靈長類（我們的遠親）在樹梢跳躍。而演化史上最驚人的「逆向工程」也發生在此刻——一群原本生活在水邊的偶蹄類動物，決定重返海洋，從長著腿的「巴基鯨」一步步演化成了巨大的「龍王鯨」（Basilosaurus）。 始新世是演化的煉金爐，它在高溫高壓下，鍛造出了現代鯨魚、馬、大象和猴子的原型，奠定了今日哺乳動物世界的基礎格局。
                    </span>
                    <span className="font-bold text-gray-900 block mb-3 text-xl">
                    【科學家的悄悄話】
                    </span>
                    <span className="block leading-relaxed">
                    「這是一個關於『極致繁榮』的啟示。始新世的地質紀錄表明：地球曾經非常熱，熱到兩極都長樹。雖然這對今天的我們來說是災難，但對當時的生命來說，那是揮霍能量、大膽嘗試形態轉換（如下海變鯨魚）的黃金年代。」
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
                    【古新世：廢墟上的蕨類復甦與倖存者黎明】
                    </span>
                    <span className="font-bold text-gray-900 block mb-3 text-xl">
                    (The Paleocene Epoch: The Fern Spike Recovery and Dawn of Survivors)
                    </span>
                    <span className="block leading-relaxed mb-4">
                    由來：Paleo (古) + Cene (新)。「古老的」新時期（現代物種還很少）。
                    </span>
                    <span className="block leading-relaxed mb-4">
                    如果說 K-Pg 大滅絕是地球心跳驟停的瞬間，那麼緊接而來的古新世，就是地球在加護病房中「甦醒與癒合」的關鍵時刻。當撞擊造成的塵埃落定，陽光重新穿透大氣，首先接管這個灰色世界的並不是森林，而是生命力極強的「蕨類植物」（Fern Spike）。 地質紀錄顯示，當時的災後地表幾乎被單一的蕨類綠海覆蓋，它們像是一層巨大的繃帶，包裹住燒焦的大陸。隨著氣候迅速回暖，地球從「核子冬天」擺盪回「溫室狀態」，茂密的亞熱帶叢林開始瘋狂生長，甚至延伸到了極圈。這時的森林與現代不同，鬱閉度極高，幽暗且潮濕，像是一個巨大的、蒸氣瀰漫的培養皿，正在靜靜地修復著破碎的生態鏈。
                    </span>
                    <span className="block leading-relaxed">
                    而在這片幽暗的復甦森林中，動物界正處於一種奇特的「權力真空期」。倖存下來的哺乳動物雖然擺脫了恐龍的陰影，但牠們還沒來得及變大，大多數仍保留著類似鼩鼱或負鼠的「古老樣貌」——體型小、大腦簡單、四肢短粗。因為哺乳類還不夠強大，頂級掠食者的寶座暫時被「爬行類餘黨」與「巨型鳥類」竊據。巨大的鱷魚與像巴士一樣長的「泰坦巨蟒」（Titanoboa）在沼澤中稱王 ，而不會飛的巨型肉食鳥類則在林間巡視。古新世是一個「草莽英雄」的時代，現代哺乳動物的家譜還在草稿階段，生態系由一群奇形怪狀的「災後倖存者」暫時拼湊而成，等待著演化的下一輪洗牌。
                    </span>
                    <span className="font-bold text-gray-900 block mb-3 text-xl">
                    【科學家的悄悄話】
                    </span>
                    <span className="block leading-relaxed">
                    「這是一個關於『填補空缺』的故事。古新世的化石紀錄告訴我們：大自然最討厭真空。當霸主（恐龍）消失，生態系不會閒置，而是會迅速抓來手邊現有的材料（蕨類、鱷魚、古老哺乳類），用最快的速度拼湊出一個暫時運作的新世界。」
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
            【K-Pg 大滅絕：終結霸業的宇宙重開機鍵】
            </span>
            <span className="font-bold text-red-800 block mb-3 text-xl">
            (The K-Pg Extinction: The Cosmic Reset Button that Ended an Empire)
            </span>
            <span className="block leading-relaxed mb-4">
            如果說白堊紀是一場熱鬧非凡的嘉年華，那麼 6600 萬年前的那一天，就是音樂戛然而止的「斷電時刻」。一顆直徑約 10 公里、相當於一座聖母峰大小的小行星，以驚人的速度撞向了今日的墨西哥尤卡坦半島（希克蘇魯伯隕石坑）。撞擊的瞬間，釋放出的能量相當於數十億顆原子彈同時爆炸，引發了席捲全球的超級海嘯與地震。但这還不是最致命的，撞擊將大量的岩石氣化並拋入大氣層，這些高溫碎片重返地球時引發了全球性的森林大火，讓天空變成了炙熱的烤箱。隨後，厚重的塵埃與硫化物遮蔽了陽光，地球迅速從「火爐」轉入「核子冬天」。陽光被阻擋意味著光合作用停止，植物大量死亡，這條鎖鏈迅速向上崩潰：植食恐龍餓死，肉食恐龍隨之滅亡。
            </span>
            <span className="block leading-relaxed">
            然而，這場浩劫對生命來說，是一道無情卻精準的「代謝率篩選門」。那些曾經讓恐龍稱霸的優勢——巨大的體型與高能量需求，在糧食匱乏的災後世界變成了致命的詛咒。反觀我們的祖先——原始哺乳動物，憑藉著「微小、雜食與穴居」的三大生存策略，在這場賭局中贏得了勝利。牠們躲在地下避過了最初的高溫與火災，依靠昆蟲、腐肉甚至植物根莖熬過了漫長的黑暗寒冬。當塵埃終於落定，陽光再次灑向地表時，倖存的哺乳類驚訝地發現，那些壓制了牠們一億多年的巨大陰影（恐龍）徹底消失了。地球的生態系被強制格式化，留下了廣闊的空白等待牠們去填補。
            </span>
            <span className="font-bold text-red-800 block mb-3 text-xl">
            【科學家的悄悄話】
            </span>
            <span className="block leading-relaxed mb-4">
            「這是一個關於『運氣與韌性』的教訓。K-Pg 滅絕事件告訴我們：演化並沒有既定的劇本，曾經不可一世的霸主（恐龍）可能因為一顆石頭而瞬間崩盤，而卑微的倖存者（哺乳類），只要能熬過最黑暗的夜，就能迎來屬於自己的黎明。」
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
            由來：「岩石特徵與山脈」系列—德法瑞邊境的岩層。到了中生代，命名的焦點轉移到了歐洲大陸（德國、法國、瑞士）。
            </span>
            <span className="block leading-relaxed mb-4">
            如果將地球歷史比作一棟房子，古生代是在打地基，而距今 2.5 億年到 6600 萬年前的中生代，則是地球進行最奢華裝修的「豪宅擴建期」。這個時代的地球地形發生了劇變，原本黏在一起的「盤古大陸」開始像一塊被剝開的巨大餅乾，分裂成我們今天熟悉的各個大洲。 這個漫長的「撕裂過程」雖然引發了無數火山與地震，卻也創造出了綿延的海岸線與新生的海洋（如大西洋的誕生）。更重要的是，中生代的地球是一個「超級溫室」——兩極完全沒有冰帽覆蓋，海平面高漲，溫暖潮濕的氣候從赤道一路延伸到高緯度地區。這種全球性的「恆溫泳池」環境，讓地球變成了一個巨大的熱帶叢林，為巨型生物的登場鋪好了紅地毯。
            </span>
            <span className="block leading-relaxed">
            在這個高溫且能量充沛的舞台上，生命不再滿足於匍匐前進，而是追求「巨大化與立體化」的極致。這是「爬行動物的黃金年代」，牠們接管了海、陸、空的所有領域：陸地上有震動大地的恐龍，海洋裡有凶猛的魚龍與滄龍，天空中有遮天蔽日的翼龍。與此同時，植物界也經歷了權力交接，高大的裸子植物（如松柏、蘇鐵）構成了鬱鬱蔥蔥的綠色天際線，而在中生代晚期，「開花植物」（被子植物）驚艷登場，為這顆原本只有綠褐色的星球第一次抹上了繽紛的色彩。 如果沒有中生代這場長達一億八千萬年的「高能量派對」，地球可能永遠無法孕育出如此複雜且龐大的生態系統。
            </span>
            <span className="font-bold text-gray-900 block mb-3 text-xl">
            【科學家的悄悄話】
            </span>
            <span className="block leading-relaxed mb-4">
            「這是一個『分久必合，合久必分』的宏大實驗。盤古大陸的分裂看似破壞，實則創造了更多元的棲息地（隔離演化）。中生代告訴我們：混亂與分裂有時是多樣性的溫床，正是因為大陸『分家』了，生命才有了各自精彩演化的空間。」
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
               【白堊紀：百花齊放的破碎大陸盛世】
                </span>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                (The Cretaceous Period: The Blooming Golden Age of Fragmented Continents)
                </span>
                <span className="block leading-relaxed mb-4">
                由來：拉丁文 Creta (白堊/粉筆)。這個時期的地層沉積了大量微小生物殼體形成的白色岩石（如著名的英國多佛白堊斷崖）。
                </span>
                <span className="block leading-relaxed mb-4">
                如果說侏羅紀是一個統一的「綠色帝國」，那麼 1.45 億年前開啟的白堊紀，就是一個百家爭鳴的「列國時代」。此時的盤古大陸已經徹底分崩離析，南美洲與非洲像一對分手的戀人越離越遠，中間隔著越來越寬的大西洋。劇烈的海底火山活動推高了洋底，導致全球海平面上升到地質史上的巔峰，現今許多陸地（如北美大平原、歐洲）在當時都成了溫暖的「淺海與群島」。 這種地理隔離就像是把生物關進了不同的「獨立實驗室」，讓各個大陸演化出了截然不同的恐龍家族（例如北美的霸王龍與三角龍，南方的阿貝力龍）。此外，這些廣闊的溫暖淺海滋養了無數微小的浮游生物，牠們死後的骨骼沉積海底，形成了厚厚的白色白堊層（Chalk），這正是這個地質年代名稱的由來。
                </span>
                <span className="block leading-relaxed">
                然而，白堊紀最革命性的環境變遷，不在海洋，而在於陸地上的「色彩革命」。在漫長的綠色統治後，地球上第一朵「被子植物」（開花植物）悄然綻放。 這看似微小的變化，引發了生態系的蝴蝶效應：花朵為了傳粉，與昆蟲（如蜜蜂、蝴蝶）建立了緊密的合作關係，極大提高了繁殖效率。原本單調的森林底層突然變得色彩斑斕，充滿了高能量的果實與花蜜。這場「被子植物大爆發」徹底改變了恐龍的菜單與演化方向，逼迫草食恐龍演化出更複雜的咀嚼系統（如鴨嘴龍類的研磨齒列）來應對這些快速生長的新型植物。白堊紀的地球，是一個因「隔離」而多樣，因「鮮花」而躁動的高能量世界。
                </span>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                【科學家的悄悄話】
                </span>
                <span className="block leading-relaxed mb-4">
                「這是一個關於『協同演化』的故事。白堊紀告訴我們：強者（恐龍）並不總是改變環境的主角，有時候，一朵柔弱的小花與一隻不起眼的昆蟲聯手（授粉共生），就能改寫整顆星球的生態運作規則。」
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
               【侏羅紀：裂解大陸的濕熱伊甸園】
                </span>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                (The Jurassic Period: The Humid Eden of the Splitting Continent)
                </span>
                <span className="block leading-relaxed mb-4">
                由來：Jura Mountains (侏羅山脈)。來自法國與瑞士邊境的侏羅山脈，那裡有大量該時期的石灰岩。
                </span>
                <span className="block leading-relaxed mb-4">
                如果說三疊紀是一場發生在紅色荒漠裡的「飢餓遊戲」，那麼 2.01 億年前開啟的侏羅紀，就是一場物資無限供應的「吃到飽盛宴」。這一切的轉變，源於地球地理格局的根本性崩解——那塊巨大的「盤古大陸」終於承受不住內部的張力，開始像一塊被剝開的餅乾一樣四分五裂。大西洋的裂口被撕開，海水湧入大陸內部，原本被陸地鎖住的乾燥內陸終於迎來了來自海洋的濕潤水氣。於是，曾經焦黃的地球迅速轉綠，變成了一個溫暖、潮濕且沒有冰河的「超級溫室」。 放眼望去，不再是貧瘠的沙礫，而是由巨大的裸子植物（如松柏、蘇鐵、銀杏）所構成的綠色海洋。這個恆溫且多雨的環境，就像是將地球空調設定在最舒適的「熱帶模式」，為生命的爆發性增長提供了最完美的物理條件。
                </span>
                <span className="block leading-relaxed">
                在這個糧食過剩的綠色舞台上，演化不再追求耐旱的苟且，而是轉向了「極致的巨大化」。由於大氣中高濃度的二氧化碳促進了植物的瘋狂生長，但這些裸子植物纖維粗糙、難以消化，這反而促使恐龍演化出了巨大的體型與長長的脖子（如腕龍、梁龍），變成一座座行走的「生化發酵槽」，只為了更有效地處理這些海量的食物。這是一個「巨人的時代」，陸地上有幾十噸重的蜥腳類恐龍在大快朵頤，海洋裡有滑齒龍這樣的巨型掠食者巡弋，天空中則飛翔著多樣化的翼龍。如果沒有侏羅紀這場因為大陸分裂而帶來的「濕氣紅利」，恐龍可能永遠只能是三疊紀那樣中等體型的跑者，而無法演化出那些讓我們仰望至今的傳奇巨獸。
                </span>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                【科學家的悄悄話】
                </span>
                <span className="block leading-relaxed mb-4">
                「這是一個『富足產生極端』的範例。侏羅紀的環境告訴我們：當資源變得唾手可得且環境極度穩定時，生命就會開始挑戰物理學的極限，創造出那些在貧瘠時代無法想像的龐然大物。」
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
                <span className="font-bold text-red-800 block mb-3 text-xl">
                【科學家的悄悄話】
                </span>
                <span className="block leading-relaxed mb-4">
                「這是一個關於『運氣大於實力』的經典案例。這場滅絕告訴我們：恐龍之所以能統治地球一億多年，並不是因為牠們在三疊紀擊敗了對手，而是因為一場剛好發生的火山爆發幫牠們『清除了障礙』。有時候，生存不需要你是最強的，只需要你是最幸運的。」
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
               【三疊紀：焦土重生的極限荒原】
                </span>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                (The Triassic Period: The Scorched Wasteland of Resurrection)
                </span>
                <span className="block leading-relaxed mb-4">
                由來：拉丁文 Trias (數字 3)。當時在德國發現這個地層有明顯的「三層結構」（紅砂岩、石灰岩、頁岩），故名三疊。
                </span>
                <span className="block leading-relaxed mb-4">
                如果說二疊紀的結尾是地球歷史上最黑暗的「滅絕午夜」，那麼 2.52 億年前開啟的三疊紀，就是在那片廢墟上緩緩升起的「殘酷黎明」。當時的地球依然維持著「盤古大陸」的聚合狀態，這塊巨大的陸地像是一個巨大的屏障，阻擋了海洋濕氣的進入。因此，三疊紀早期的陸地景觀並非我們想像中的恐龍樂園，而是一片廣袤無邊、甚至比撒哈拉更乾燥的「超級紅色荒漠」。 氣候炎熱乾燥，兩極依然沒有冰帽，地球就像是一個散熱不良的「烤爐」。唯有在大陸邊緣，存在著一種被稱為「超級季風」（Megamonsoon）的劇烈氣候現象——雨季時暴雨如注，旱季時滴水未進。這種極端不穩定的氣候，將地球變成了一個對生命極度不友善、稍有不慎就會脫水而死的嚴酷競技場。
                </span>
                <span className="block leading-relaxed">
                然而，正是這片看似被詛咒的荒原，成為了演化史上最大的「機會之地」。由於前一次大滅絕清空了 90% 以上的物種，原本擁擠的地球突然變得空蕩蕩的，這意味著所有的生態位都處於「虛位以待」的狀態。這片死寂的荒原實際上是一個巨大的「演化實驗室」。在乾燥的壓力下，生命被迫進行了一場關於「保水能力」的競賽。那些皮膚不夠厚、排泄浪費水分的生物（如古代兩棲類）被限制在水邊；而那些演化出緻密鱗片、能排泄尿酸以節省水分的「主龍類」（恐龍與鱷魚的祖先），則憑藉著強大的耐旱天賦，大膽地走進了荒漠深處。如果沒有三疊紀這片廣闊且空曠的焦土作為舞台，恐龍家族可能永遠無法獲得足夠的空間與資源，去開啟後來的霸業。
                </span>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                【科學家的悄悄話】
                </span>
                <span className="block leading-relaxed mb-4">
                「這是一個關於『真空效應』的故事。三疊紀證明了：最可怕的災難（大滅絕）往往伴隨著最大的機遇。當舊的統治者離場，留下的巨大空白（生態位），就是新王（恐龍）加冕的王座。」
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
            <span className="font-bold text-red-800 block mb-3 text-xl">
            【科學家的悄悄話】
            </span>
            <span className="block leading-relaxed mb-4">
            「生命就像水流，當舊的河道被堵死，它總會在大地上衝刷出全新的路徑。二疊紀的結束教會我們：毀滅往往是新生的序章，演化從不回頭，只會向前尋找出路。」
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
            由來：「英國地理與部落」系列—19 世紀英國地質學家的後花園。你會發現這裡充滿了英國的地名，因為當時英國的地質學家正在瘋狂地研究自家地層。
            </span>
            <span className="block leading-relaxed mb-4">
            如果將地球的歷史濃縮成一部電影，那麼跨越近 3 億年的古生代，絕對是場景變化最劇烈的「極限改造王」特輯。故事的開端（約 5.4 億年前），地球看起來還像是火星的孿生兄弟——陸地是一片赤紅的荒漠，所有精彩的生命都蜷縮在藍色的海洋裡。然而，隨著時間推移，這顆星球經歷了地質史上最瘋狂的板塊舞蹈：大陸分分合合，最終撞擊成巨大的「盤古大陸」。 與此同時，大氣層也經歷了翻天覆地的重組，氧氣濃度從稀薄一路飆升到「醉氧」的高峰。這不僅僅是歲月的流逝，而是一場物理與化學環境的「全面地球化工程」，將原本只有岩石與海水的單調世界，一步步改造成擁有森林、河流與複雜氣候系統的宜居星球。
            </span>
            <span className="block leading-relaxed">
            而在這不斷變動的舞台上，生命上演了一場史詩般的「登陸諾曼第」。古生代的故事主軸，就是生命如何克服對水的依賴，發起向陸地進軍的衝鋒。從最初在海裡穿著盔甲的三葉蟲，到鼓起勇氣爬上岸的兩棲類，再到最終演化出羊膜卵、能在沙漠中行走的爬行動物，生命展現了驚人的可塑性。這是一場接力賽：植物先鋒部隊率先登陸，將岩石轉化為土壤並釋放氧氣，隨後節肢動物與脊椎動物跟進，將荒涼的大陸變成了喧鬧的家園。雖然古生代最終在一場慘烈的大滅絕中落幕，但它確立了現代生態系的所有基礎規則——骨骼的架構、森林的運作、以及脊椎動物對陸地的統治權，全都是在這個時代奠定的。
            </span>
            <span className="font-bold text-gray-900 block mb-3 text-xl">
            【科學家的悄悄話】
            </span>
            <span className="block leading-relaxed mb-4">
            「古生代是地球的『青春期』，充滿了躁動、變化與無盡的嘗試。它告訴我們：生命從不甘於被侷限在起點（海洋），只要給予足夠的時間，演化總能找到辦法，將荒原變成沃土，將不可能變成日常。」
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
                由來：Perm (佩爾姆)，這是少數的例外，來自俄羅斯的佩爾姆地區（Perm），由蘇格蘭地質學家莫奇森命名。中文譯名「二疊紀」的來源是在德國的同年代地層的上層是鎂質灰岩，下層是紅色砂岩之故。
                </span>
                <span className="block leading-relaxed mb-4">
                如果說之前的石炭紀是地球的一場「蒸汽桑拿浴」，那麼 2.99 億年前開啟的二疊紀，就是將這場桑拿突然關掉，換成了一個巨大的「乾燥烤箱」。這一切源於地質史上最驚人的一次「強制合併」——地球上所有的陸塊終於撞在一起，形成了唯一的超級大陸：「盤古大陸」（Pangea）。這塊大陸大得難以想像，導致了一個致命的後果：來自海洋的水氣根本無法到達廣闊的內陸。於是，石炭紀那些鬱鬱蔥蔥的濕地雨林崩潰了，取而代之的是一望無際的紅色沙漠與季節性的劇烈季風（超級季風）。對於那些習慣了皮膚濕潤、依賴水窪繁殖的兩棲類來說，這就像是原本住在豪華泳池別墅，突然被丟進了撒哈拉沙漠，生存空間被極度壓縮。
                </span>
                <span className="block leading-relaxed">
                然而，正是這種嚴酷的乾燥環境，逼出了演化史上最關鍵的一次「硬體升級」。為了不被烤乾，生命被迫發明了兩樣革命性的道具：「防水皮膚」與「羊膜卵」。植物界由耐旱的裸子植物（如銀杏、蘇鐵的祖先）接管了世界；而動物界則由我們的遠親——背上長著巨大帆狀物的「合弓綱」動物（如異齒龍） 登上了霸主寶座。羊膜卵就像是生物為胚胎準備的「私人行動泳池」，讓動物不再受限於水邊，可以大膽地向內陸深處挺進。如果沒有二疊紀這場極端的「乾燥壓力測試」，脊椎動物可能永遠只是在水邊徘徊的兩棲過客，而無法真正征服大陸的深處。
                </span>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                【科學家的悄悄話】
                </span>
                <span className="block leading-relaxed mb-4">
                「這是一個關於『獨立』的故事。二疊紀的環境迫使生命切斷了對水體（海洋/河流）的絕對依賴。這告訴我們：環境的舒適圈一旦打破，往往就是生命獲得真正自由（脫離水面）的時刻。」
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
                由來：拉丁文 Carbo (煤) + Ferous (攜帶)，意為「含煤的」。因為這時期的地層富含煤炭（工業革命的燃料）。石炭紀是第一個不以其研究岩層的所在地命名的地質時期。
                </span>
                <span className="block leading-relaxed mb-4">
                如果說泥盆紀是地球的「綠化工程」，那麼 3.59 億年前的石炭紀，就是這項工程失控後形成的「全球蒸氣桑拿房」。當時的大陸板塊正緩慢地聚集成盤古大陸，廣闊的低地形成了無邊無際的熱帶沼澤濕地。這裡的景象與現代森林截然不同，你看不到熟悉的橡樹或松樹，取而代之的是高達 40 公尺的「鱗木」與「封印木」。這些像是巨大綠色電線桿的蕨類植物密集排列，遮蔽了天空，地表永遠瀰漫著濃霧與腐植質的氣味。這是一個極度潮濕、悶熱且暗無天日的環境，就像是一個沒有出口的巨型溫室，植物的生長速度快得驚人，將地球變成了一顆鬱鬱蔥蔥的「綠色毛球」。
                </span>
                <span className="block leading-relaxed">
                然而，這座森林最驚人的秘密藏在「空氣」裡。由於植物瘋狂地進行光合作用，加上當時的微生物還沒演化出分解木質素的能力，導致死去的樹木無法腐爛，大量的碳被鎖在地底（變成了今天的煤炭），而氧氣則被留在空氣中，使大氣含氧量飆升至史無前例的 35%（現今只有 21%）。這就像是給地球的大氣層打了「高濃度的興奮劑」，打破了生物體型的限制。對於依靠氣管呼吸的節肢動物來說，高氧環境意味著牠們可以長得無限巨大而不會缺氧。於是，展翼像老鷹一樣寬的巨脈蜻蜓（Meganeura） 飛舞在空中，長達兩公尺的巨型馬陸在林間穿梭。這是一個被高氧「充能」的巨獸時代，也是地球為人類預存下最多化石能源的「儲蓄期」。
                </span>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                【科學家的悄悄話】
                </span>
                <span className="block leading-relaxed mb-4">
                「這是一個關於『消化不良』的幸運意外。因為當時的細菌『吃不下』木頭，地球才得以鎖住碳、釋放氧，造就了巨蟲傳奇與能源礦藏。這告訴我們：生態系中的一個小小缺失（分解者的缺席），有時竟能改變整顆星球的命運。」
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
                <span className="font-bold text-red-800 block mb-3 text-xl">
                【科學家的悄悄話】
                </span>
                <span className="block leading-relaxed mb-4">
                「自然的系統是如此緊密相連，陸地上的每一次呼吸（植物光合作用），都可能決定海洋深處的命運。這場滅絕提醒我們：生命的創新（森林的出現）有時會伴隨著沈重的代價，但危機往往也是演化突破瓶頸的催化劑。」
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
                【泥盆紀：地球綠化與重裝武力的軍備競賽】
                </span>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                (The Devonian Period: The Greening of Earth and the Armored Arms Race)
                </span>
                <span className="block leading-relaxed mb-4">
                由來：Devon (德文郡)，來自英國西南部的德文郡（Devonshire），那裡有泥盆紀地質典型的紅色砂岩。中文名稱源自舊時日本人使用漢字音讀的音譯名「泥盆紀」。
                </span>
                <span className="block leading-relaxed mb-4">
                如果說寒武紀是生命的「試水溫」，那麼 4.19 億年前的泥盆紀，就是地球史上最浩大的「景觀改造工程」。在此之前，陸地是一片褐色的荒原，但在泥盆紀，地球第一次穿上了「綠色外衣」。植物不再滿足於趴在地上當苔蘚，它們演化出了堅硬的木質素和深根，挺直腰桿變成了高大的樹木（如古蕨類），組成了地球上第一座真正的森林。 這時的空氣中瀰漫著前所未有的清新氧氣，原本死寂的內陸開始充滿生機。這不僅僅是視覺上的綠化，更是大氣層的徹底翻修，植物瘋狂地進行光合作用，將大氣中的氧氣濃度推向新高，為後來巨型動物的登陸備好了充足的「燃料」。
                </span>
                <span className="block leading-relaxed">
                當陸地正在進行綠色革命時，海洋則變成了一個凶險的「重裝競技場」。泥盆紀被稱為「魚類時代」，但這裡游的可不是我們餐桌上那些軟弱的魚，而是身披厚重骨板、宛如裝甲坦克的「盾皮魚類」（如鄧氏魚）。 這場海洋軍備競賽的背後推手，竟然是陸地上的森林。強壯的植物根系深入岩層，加速了岩石風化，將大量的磷與營養鹽沖刷入海。這就像是向海洋注入了強效的「生長激素」，引發了浮游生物的暴增，進而支撐起龐大而複雜的食物鏈。泥盆紀的時空環境是一個完美的「生態迴路」：陸地的綠化滋養了海洋的巨獸，而海洋的競爭壓力又迫使弱者（如我們的祖先）試圖爬上那片鬱鬱蔥蔥的新大陸尋求庇護。
                </span>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                【科學家的悄悄話】
                </span>
                <span className="block leading-relaxed mb-4">
                「這是一個『唇齒相依』的時代。泥盆紀告訴我們：陸地與海洋從來都不是兩個獨立的世界。森林的每一次深呼吸，都牽動著深海裡每一次殘酷的獵殺。地球是一個整體，沒有誰能獨善其身。」
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
                由來：Silures (志留族)，古羅馬時代另一支居住在威爾斯邊境的凱爾特部落名稱。最早被研究的志留紀岩層采自這個部族在歷史上所定居的傳統區域。中文名則是參考了近代日本學界使用漢字音讀的音譯名「志留利亜紀」。
                </span>
                <span className="block leading-relaxed mb-4">
                如果說奧陶紀的結尾是一場將生命凍結的噩夢，那麼 4.4 億年前開啟的志留紀，就是地球從重症加護病房甦醒後的「復健與回暖」。隨著岡瓦納大陸的冰蓋融化，原本被鎖住的水分重新奔回海洋，讓海平面再次回升，溫暖的淺海重新覆蓋了大陸邊緣。但这时的地球並不安靜，板塊運動劇烈，大陸板塊像慢動作的碰碰車一樣撞在一起（加里東造山運動），隆起了巨大的山脈。這創造出了一個地貌複雜多變的世界：一邊是溫暖平靜的淺海珊瑚礁，另一邊是因碰撞而混濁、充滿沉積物的海灣。這種劇烈的地質活動，雖然讓環境變得不穩定，卻也攪動了營養物質，為倖存的海洋生物提供了豐富的「災後重建資金」。
                </span>
                <span className="block leading-relaxed">
                而志留紀最關鍵的環境遺產，並不在海裡，而是在頭頂那看不見的高空——「臭氧層防護罩」的正式啟用。在此之前，陸地就像是暴露在強烈紫外線下的「微波爐」，任何試圖登陸的生命都會被燒傷或破壞 DNA。但在志留紀，大氣中的氧氣濃度終於累積到足夠高，形成了一層厚實的臭氧層，有效地過濾了致命的紫外線。這個看不見的「防護罩」，將原本是生命禁區的陸地，變成了安全的「新大陸」。於是，在潮濕的水邊，第一批原始的維管束植物（如頂囊蕨）開始羞澀地探出頭來，將那原本只有紅褐色岩石的荒原，第一次染上了生命的綠意。如果沒有志留紀搭建的這個大氣屏障，地球的陸地可能至今仍是一片死寂的荒漠。
                </span>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                【科學家的悄悄話】
                </span>
                <span className="block leading-relaxed mb-4">
                「這是一個關於『安全感』的故事。志留紀的大氣環境告訴我們：生命的突破往往需要一層看不見的保護（臭氧層）。當致命的威脅被移除，哪怕是最微小的嘗試（第一株陸生植物），最終也能長成覆蓋全球的森林。」
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
                <span className="font-bold text-red-800 block mb-3 text-xl">
                【科學家的悄悄話】
                </span>
                <span className="block leading-relaxed mb-4">
                「這是一堂關於『舒適圈』的殘酷課程。奧陶紀的生物太適應溫暖穩定的淺海，以至於無法應對變局。這告訴我們：演化的成功不在於當下有多繁盛，而在於面對劇變時，你保留了多少改變的潛力。」
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
                由來：Ordovices (奧陶维斯族)，古羅馬時代居住在威爾斯的一支凱爾特部落名稱。最早被研究的奧陶紀岩層取自於這個部族歷史上的傳統住地而得名。
                </span>
                <span className="block leading-relaxed mb-4">
                如果說寒武紀是生命這場戲的「首映之夜」，那麼緊接而來的奧陶紀（距今約 4.85 億年），就是票房大賣後的「全面擴張期」。這時的地球是一個徹頭徹尾的「超級水世界」。由於氣候異常溫暖，兩極沒有冰帽，海平面上升到了古生代的最高點。海水不再只是輕拍海岸，而是大膽地入侵內陸，將原本廣闊的陸地變成了無數星羅棋布的淺海與群島。如果你當時能從外太空俯瞰地球，你會發現那標誌性的藍色幾乎佔據了所有視野，陸地反倒成了點綴其中的島嶼。這片無邊無際、陽光穿透的淺海，成為了孕育多樣性的超級溫床，其規模之大，是現代海洋完全無法比擬的。
                </span>
                <span className="block leading-relaxed">
                而在這片無限擴張的藍色領土中，生態系正經歷一場名為「奧陶紀生物大輻射」的**「城市化運動」。不同於寒武紀專注於發明奇怪的身體構造（創造新門類），奧陶紀的生物專注於將現有的設計發揚光大（增加物種數量）。海洋中第一次出現了真正的「立體建築」**——原始的珊瑚與層孔蟲開始堆疊，建造出地球上第一批礁岩，為無數生物提供了複雜的藏身處與公寓。同時，海水中微小的浮游生物爆發性增長，就像是建立了穩定的「糧食供應網」，支撐起更長、更複雜的食物鏈。如果說寒武紀搭建了生命的骨架，那麼正是奧陶紀這溫暖且廣闊的環境，為這具骨架填滿了豐富血肉，將海洋變成了一座熱鬧非凡、階級分明的水下大都會。
                </span>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                【科學家的悄悄話】
                </span>
                <span className="block leading-relaxed mb-4">
                「這是一個『量變產生質變』的時代。奧陶紀的環境證明了：當生存空間被極大化（海侵），生命就會以驚人的細緻度去填充每一個角落。這不再是嘗試錯誤的草創期，而是生命多樣性真正繁榮的黃金年代。」
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
                由來：來自於英國威爾斯的古代地名「坎布里亞 Cambria」 (威爾斯的拉丁古名)，最早在英國威爾斯發現該地層。中文譯名則源自舊時日本人使用漢字音讀的音譯名「寒武利亜紀」
                </span>
                <span className="block leading-relaxed mb-4">
                如果說後來的地質年代是熱鬧的叢林或草原，那麼 5.4 億年前的寒武紀，就像是一顆「表裡不一」的奇異星球。如果你當時站在陸地上，你會以為自己登陸了火星——放眼望去只有紅色的岩石與沙礫，沒有一棵樹、一根草，甚至聽不到一聲蟲鳴，死寂得令人發慌。但在這片荒涼的海岸線之外，情況卻截然不同。隨著前一代的超級大陸（羅迪尼亞大陸）崩解，陸塊分散漂移，導致全球海平面大幅上升，淹沒了沿海的低地。這在地球表面創造出了廣闊無邊、陽光充足且溫暖的「淺海大陸棚」。這些淺海就像是為了迎接生命而特製的「巨型恆溫培養皿」，陽光能直射海底，水溫舒適宜人，為生命的繁衍提供了最奢華的物理環境。
                </span>
                <span className="block leading-relaxed">
                而這個水下劇場不只提供了場地，還準備了關鍵的「道具與特效」。在寒武紀的海洋中，化學成分發生了劇變，海水中的鈣與碳酸根離子濃度達到飽和，這意味著生物第一次可以輕鬆地從水中提取材料來建造堅硬的骨骼與外殼。同時，大氣與海洋中的氧氣含量雖然不如今日，但也終於跨過了支持複雜運動的門檻。正是這種「溫暖淺海」加上「豐富原料」的環境組合，才讓生物有本錢去嘗試長出厚重的盔甲或耗能的大腦。如果沒有寒武紀這得天獨厚的地理與化學環境做後盾，就算生命有再強的演化動力，也無法在那場「大爆發」中上演如此精彩的變裝秀。
                </span>
                <span className="font-bold text-gray-900 block mb-3 text-xl">
                【科學家的悄悄話】
                </span>
                <span className="block leading-relaxed mb-4">
                「演員（生命）固然重要，但舞台（環境）決定了演出的上限。寒武紀告訴我們：當資源、氣候與空間都準備好時，創新就不再是偶然，而是一種必然的爆發。」
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
                    <span className="font-bold text-gray-900 block mb-4 text-xl">
                    【科學家的悄悄話】
                    </span>
                    <span className="block leading-relaxed">
                    「這就像是生命第一次學會了『競爭』。寒武紀大爆發告訴我們：壓力與挑戰，往往是激發創意的最強催化劑。安逸的環境只能孕育簡單的生命，唯有危機感，才能逼出繁複而精彩的可能。」
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
      <span className="font-bold text-red-800 block mb-3 text-xl">
      【元古宙：氧氣大浩劫與雪球地球的試煉】
      </span>
      <span className="font-bold text-red-800 block mb-3 text-xl">
      (The Proterozoic Eon: The Great Oxidation Catastrophe and the Snowball Trials)
      </span>
      <span className="block leading-relaxed mb-4">
      由來：Proteros (較早) + Zoe (生命)，意指「早期的生命」。因為其是生命史上奠定生物演化方向的重要時期。最早的內共生、真核生物、多細胞生物和有性繁殖以及最早的原蟲、藻類和動物都出現於元古宙。
      </span>
      <span className="block leading-relaxed mb-4">
      如果說太古宙是細菌們安靜的黏液天堂，那麼 25 億年前開啟的元古宙，就是一場由細菌引發的「全球生化危機」。這一切的始作俑者是一種學會了利用陽光製造能量的小傢伙——「藍綠菌」（Cyanobacteria）。它們進行光合作用，將一種對當時所有生命來說都是劇毒的廢氣排放到海水中，這種氣體就是「氧氣」。起初，這些氧氣被海洋中溶解的鐵離子吸收，生成紅色的鐵鏽沉澱，形成了今天我們開採的「帶狀鐵礦層」（Banded Iron Formations）。 但當海洋中的鐵被耗盡後，氧氣開始溢出到大氣層。這導致了兩大後果：第一，大氣中的甲烷被氧化清除，原本橙色的天空終於變成了我們熟悉的「蔚藍色」；第二，原本適應無氧環境的古老微生物遭遇了滅頂之災，這是地球史上第一場大規模滅絕事件——「大氧化事件」（Great Oxidation Event）。
      </span>
      <span className="block leading-relaxed">
      雖然氧氣殺死了舊生命，但也逼出了更強大的新生命。在元古宙的中期，為了抵禦氧氣的毒性或利用氧氣的高能量，單細胞生命發生了融合，誕生了擁有細胞核的「真核生物」（Eukaryotes）。這是所有現代動植物的共同祖先。然而，元古宙的結尾並不好過。由於溫室氣體（甲烷）被氧氣破壞，地球失去了保暖層，氣溫驟降。在距今約 7 億年前的成冰紀，冰層從兩極一路蔓延到赤道，整顆地球被凍成了一顆白色的雪球，這就是著名的「雪球地球」（Snowball Earth）時期。 生命在厚達數公里的冰層下苟延殘喘了數千萬年，直到火山噴出的二氧化碳再次溫暖地球，才迎來了「埃迪卡拉紀」與生命的復甦。
      </span>
      <span className="font-bold text-red-800 block mb-3 text-xl">
      【科學家的悄悄話】
      </span>
      <span className="block leading-relaxed mb-4">
      「這是一個關於『雙面刃』的故事。元古宙告訴我們：對於太古宙的居民來說，氧氣是毀滅世界的毒氣；但對於我們來說，氧氣是生命之源。我們呼吸的每一口氣，都要感謝 20 億年前那些藍綠菌製造的『污染』。」
      </span>
    </>
    ),
    image: 'Proterozoic.jpg',
    
    children: [
      {
        id: 'ediacaran',
        name: '埃迪卡拉紀 (Ediacaran)',
        englishName: 'Ediacaran',
        start: 635,
        end: 538.8,
        theme: 'rose',
        description: (
          <>
            <span className="font-bold text-gray-900 block mb-3 text-xl">
            【埃迪卡拉紀：暴風雨前的寧靜花園】
            </span>
            <span className="font-bold text-gray-900 block mb-3 text-xl">
            (The Ediacaran Period: The Quiet Garden Before the Storm)
            </span>
            <span className="block leading-relaxed mb-4">
            由來：來自澳大利亞南部的「埃迪卡拉山」（Ediacara Hills），因為那裡發現了那些神秘的軟體生物化石。
            </span>
            <span className="block leading-relaxed mb-4">
            如果說寒武紀是嘈雜的戰場，那麼距今 6.35 億至 5.41 億年前的埃迪卡拉紀，就是地球最後一段「寧靜的伊甸園」。這個時代始於一場史詩般的氣候復甦——地球剛從長達數千萬年的「雪球地球」（Snowball Earth）冰凍狀態中解凍。隨著冰川融化，大量的營養物質被沖刷進海洋，全球氣溫回暖，淺海中出現了地球歷史上第一批「肉眼可見的複雜生物」——埃迪卡拉生物群（Ediacaran biota）。
            </span>
            <span className="block leading-relaxed">
            但不要期待看到你熟悉的魚或蝦。埃迪卡拉紀的海洋就像是一場「前衛藝術展」。這裡的生物長得極其怪異，牠們沒有頭、沒有尾、沒有眼睛、沒有嘴巴，更沒有堅硬的骨骼或外殼。牠們大多是「軟體生物」，有的像巨大的充氣床墊（如狄更遜水母 Dickinsonia），有的像在海底搖曳的羽毛筆（如查恩盤蟲 Charnia），有的像圓盤或甚至像一塊布。牠們靜靜地趴在海床上，或是直立在水中，靠著皮膚直接吸收海水中的營養。這是一個「沒有掠食者」的世界，沒有追逐，沒有殺戮，只有寧靜的濾食與吸收。這是地球生命史上唯一一次，大型生物可以在毫無防備的情況下裸露著柔軟的身體生存。
            </span>
            <span className="font-bold text-gray-900 block mb-3 text-xl">
                【科學家的悄悄話】
             </span>
             <span className="block leading-relaxed mb-4">
             「這是一個關於『試錯』的謎題。埃迪卡拉紀告訴我們：生命在找到最佳方案（現代動物結構）之前，曾經嘗試過完全不同的設計圖。許多埃迪卡拉生物可能根本不是我們祖先，而是一群已經徹底滅絕的『失敗實驗品』，或者是地球上曾經存在過的另一種完全不同的生命形式（文德生物）。」
           </span>
          </>
        ),
        image: 'ediacaran.jpg',
        children: [
          {
            type: 'explosion',
            id: 'avalon_explosion',
            name: '阿瓦隆大爆發 (生命現形)',
            englishName: 'Avalon Explosion',
            time: '~635 Ma',
            image: 'Avalon_Explosion.jpg',
            // 修改 desc 如下：
            desc: (
              <>
                <span className="font-bold text-gray-900 block mb-4 text-xl">
                【阿瓦隆大爆發：深海中的碎形幾何實驗】
                </span>
                <span className="font-bold text-gray-900 block mb-4 text-xl">
                (The Avalon Explosion: The Fractal Geometry Experiment in the Deep Sea)
                </span>
                <span className="block leading-relaxed mb-4">
                由來：源於發現了大量埃迪卡拉生物群化石的加拿大紐芬蘭島東南角的阿瓦隆半島（Avalon Peninsula）。
                </span>
                <span className="block leading-relaxed">
                在埃迪卡拉紀的早期，大約 6.35 億年前，地球剛從一場規模較小的冰期（加斯奇厄斯冰期）中解凍。大氣中的氧氣含量出現了微妙的上升，這成為了點燃導火線的火花。在今天加拿大的紐芬蘭（當時還在南半球的深海裡），生命突然跨越了單細胞的門檻，發生了一場「阿瓦隆大爆發」。這場爆發的主角是一群被稱為「蘭吉形類」（Rangeomorphs）的生物。牠們是地球歷史上第一批「巨大且複雜」的生命體，有些甚至能長到 2 公尺長！
                </span>
                <span className="block leading-relaxed">
                但這場爆發最迷人的地方在於牠們的「生長策略」。這些生物生活在幽暗的深海，無法進行光合作用，也沒有嘴巴來進食。為了解決能量問題，牠們採用了一種極致的數學之美——「碎形生長」（Fractal Growth）。就像蕨類植物的葉子一樣，牠們的身體結構是不斷重複的自我相似圖形：大分枝上長著小分枝，小分枝上長著更小的分枝。這種結構能將身體的「表面積最大化」，讓牠們像一張巨大的海綿網，盡可能地從海水中直接吸收溶解的有機碳與氧氣。 這種「把身體攤平」的策略，是生命在那個沒有捕食者的和平年代，所能想出的最高效生存方案。
                </span>
                <span className="font-bold text-gray-900 block mb-4 text-xl">
                【科學家的悄悄話】
                </span>
                <span className="block leading-relaxed">
                「這是一個關於『數學與生命』的浪漫相遇。阿瓦隆大爆發告訴我們：在大自然學會製造骨骼和牙齒之前，它先愛上了幾何學。『碎形』是生命為了突破體型限制，想出的第一個天才解決方案。雖然後來這種設計被淘汰了，但它證明了演化的創意是沒有邊界的。」
                </span>
              </>
            )
          }
        ]
      }
    ]
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
      <span className="font-bold text-red-800 block mb-3 text-xl">
      【太古宙：橙色蒼穹下的黏液水世界】
      </span>
      <span className="font-bold text-red-800 block mb-3 text-xl">
      (The Archean Eon: The Slime Water World Under the Orange Dome)
      </span>
      <span className="block leading-relaxed mb-4">
      由來：希臘文 Arkhaios (起始/古老)，這是地球岩石和生命紀錄的「最開端」。若更早的岩石被發現，太古宙的定義即可往更古時代推，冥古宙則會被縮短。
      </span>
      <span className="block leading-relaxed mb-4">
      如果說冥古宙是狂暴的火與石，那麼 40 億年前開啟的太古宙，就是地球冷卻下來後變成的一顆「有毒的水球」。當時的地表幾乎被廣闊的海洋覆蓋，陸地尚未連結成大塊的大陸，只是一串串冒著煙的火山島鏈。最令人震驚的是當時的色調：因為大氣中充滿了甲烷與二氧化碳，卻幾乎沒有氧氣，天空呈現出一種詭異的「霧霾橙色」；而海洋因為富含溶解的鐵離子，不是藍色的，而是像橄欖油一樣的「深綠色」。 這是一個對現代人類來說絕對致命的環境，空氣有毒，且紫外線毫無阻擋地轟炸著地表。
      </span>
      <span className="block leading-relaxed">
      但在這片看似死寂的綠色海洋溫泉邊，發生了宇宙中最偉大的奇蹟——無機分子組成了有機分子，誕生了地球上第一批生命：「單細胞細菌與古菌」。這些最原始的地球居民雖然微小，但它們團結起來的力量驚人。在太古宙的淺海中，無數的微生物分泌出黏液，層層堆疊，建造出了當時地球上唯一的「大城市」——「疊層石」（Stromatolites）。 這些像蘑菇或石墩一樣的微生物礁石遍佈全球海岸線，它們在接下來的十幾億年裡安靜地統治著地球。太古宙是一個「慢動作」的時代，生命雖然已經誕生，但它們僅僅停留在單細胞階段，在黏液與海水中默默地進行著生化實驗，等待著改變大氣成分的那一刻。
      </span>
      <span className="font-bold text-red-800 block mb-3 text-xl">
      【科學家的悄悄話】
      </span>
      <span className="block leading-relaxed mb-4">
      「這是一個關於『時間的耐心』的故事。太古宙持續了整整 15 億年，佔了地球歷史的三分之一。在這漫長的歲月裡，生命似乎『毫無長進』，一直都是細菌。但實際上，它們正在進行最重要的發明：學會如何利用陽光（光合作用）。等到這項技術成熟，它們將釋放出一種危險的廢氣——氧氣，從而徹底毀滅當時的世界，並開啟下一個時代。」
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
      <span className="font-bold text-red-800 block mb-3 text-xl">
      【冥古宙：煉獄般的熔岩創世紀與月球誕生】
      </span>
      <span className="font-bold text-red-800 block mb-3 text-xl">
      (The Hadean Eon: The Hellish Genesis and the Birth of the Moon)
      </span>
      <span className="block leading-relaxed mb-4">
      由來：希臘神話 Hades (冥王/地獄) ，當時地球如同煉獄，充滿岩漿，像冥界一樣。冥古宙原本用於指代比已知最早岩石更早的時期，現存的冥古宙物質極為稀少，主要是來自西澳大利亞Jack Hills地區的顆粒狀鋯石。
      </span>
      <span className="block leading-relaxed mb-4">
      如果說顯生宙是熱鬧的生命舞台，那麼 46 億年前開啟的冥古宙（名稱源自希臘神話的冥王 Hades），就是這座舞台正在搭建時的「熔煉工廠」。地球剛從太陽星雲的塵埃中吸積成形，地表完全沒有固態岩石，只有翻騰不休的「岩漿海」（Magma Ocean），溫度高達數千度。當時的天空不是藍色的，而是被硫磺與火山灰籠罩的黑紅色，空氣中沒有氧氣，充滿了令人窒息的二氧化碳與氮氣。最可怕的是，當時的太陽系還很年輕，太空中充滿了失控的小行星，地球每天都在承受「重轟炸」（Heavy Bombardment），每顆撞擊地球的隕石都像核彈一樣，激起千米高的岩漿巨浪。
      </span>
      <span className="block leading-relaxed">
      然而，冥古宙發生了一件決定地球命運的「超級意外」。大約 45 億年前，一顆火星大小的原行星「特伊亞」（Theia），以一種毀滅性的角度撞上了地球。這場撞擊幾乎將地球撞碎，巨大的能量將地殼熔化並拋入太空。奇蹟發生了：這些被拋出的碎片並沒有飛走，而是在引力作用下迅速凝聚，形成了我們今天的「月球」。 有了月球的引力牽引，地球原本瘋狂的自轉速度開始變慢（當時的一天可能只有 6 小時），地軸也因此穩定下來，這為未來生命的四季輪迴奠定了基礎。隨著冥古宙末期，地表溫度終於降到水的沸點以下，大氣中的水蒸氣凝結成了一場持續數百萬年的「超級暴雨」，最終匯聚成了原始海洋，將地球從一顆火球變成了一顆水球。
      </span>
      <span className="font-bold text-red-800 block mb-3 text-xl">
      【科學家的悄悄話】
      </span>
      <span className="block leading-relaxed mb-4">
      「這是一個關於『毀滅即創造』的啟示。冥古宙幾乎沒有留下任何岩石紀錄，因為地殼都被重融了。唯一的倖存者是一種極其堅硬的微小晶體——『鋯石』（Zircon）。這些比沙粒還小的時光膠囊告訴我們：早在 44 億年前，地球表面可能就已經冷卻並出現液態水了。地獄（Hadean）冷卻的速度，比我們想像的還要快。」
      </span>
    </>
    ),
    image: 'Hadean.jpg',
    children: []
  }
];

// --- Components ---

const SmartImage: React.FC<SmartImageProps> = ({ src, alt, className, fallbackColor, type, objectFit = 'cover' }) => {
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
      className={`${className} object-${objectFit}`}
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

// ============================================================================
// DETAIL PANEL
// ============================================================================
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
        className="bg-white rounded-xl shadow-2xl max-w-[95vw] w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navigation Bar (Header) */}
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
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden h-full">
          
          {/* Left: Image Area */}
          <div className="w-full md:w-2/3 h-48 md:h-full relative bg-black flex-shrink-0 border-r border-gray-200">
            <SmartImage 
              src={unit.image} 
              alt={unit.name} 
              className="w-full h-full"
              objectFit="contain"
              fallbackColor={colors.bg}
              type={unit.type}
            />
          </div>

          {/* Right: Info & Children */}
          <div className="w-full md:w-1/3 flex flex-col h-full overflow-hidden bg-white">
            
            {/* 1. Title Section (Fixed Height) */}
            <div className={`p-5 border-b flex-shrink-0 ${headerBg} ${headerBorder}`}>
              <div>
                  <h2 className={`text-2xl font-bold ${titleColor} leading-tight`}>
                    {unit.name}
                  </h2>
                  <span className="font-mono text-xs text-gray-500">{unit.englishName}</span>
              </div>
              
              <div className={`flex items-center gap-2 font-mono font-semibold ${iconColor} mt-2 text-sm`}>
                <Clock size={16} />
                {(isExtinction || isExplosion) ? (
                  <span>{unit.time}</span>
                ) : (
                  <span>{unit.start} Ma - {unit.end} Ma</span>
                )}
              </div>
            </div>
            
            {/* 2. Scrollable Split Area */}
            <div className="flex-1 flex flex-col min-h-0">
                
                {/* 2-A. Description */}
                <div className="flex-1 overflow-y-auto p-5 border-b-4 border-gray-100 relative">
                    {/* [修正] 移除 sticky top-0，改為一般 div，現在它會跟著文字一起捲動 */}
                    <div className="pb-2 mb-2 border-b border-dashed border-gray-100 flex items-center gap-2 text-gray-400">
                        <BookOpen size={14}/> 
                        <span className="text-xs font-bold uppercase tracking-wider">{(isExtinction || isExplosion) ? '事件描述' : '時期特徵'}</span>
                    </div>
                    <div className="text-gray-700 leading-relaxed text-base pr-2 whitespace-pre-line">
                        {(isExtinction || isExplosion) ? unit.desc : (unit.description || "暫無詳細描述。")}
                    </div>
                </div>

                {/* 2-B. Children List */}
                {unit.children && unit.children.length > 0 ? (
                    <div className="flex-1 overflow-y-auto p-5 bg-gray-50 relative">
                        {/* [修正] 移除 sticky top-0，讓列表標題也跟著一起捲動 */}
                        <div className="pb-2 mb-4 border-b border-dashed border-gray-200 flex items-center justify-between text-gray-400">
                           <div className="flex items-center gap-2">
                              <Layers size={14} />
                              <span className="text-xs font-bold uppercase tracking-wider">下分層級</span>
                           </div>
                           <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-gray-200 shadow-sm text-gray-500 font-mono">
                             {unit.children.length} 子層
                           </span>
                        </div>

                        <div className="grid grid-cols-1 gap-2 pb-8">
                            {unit.children.map((child, idx) => (
                              <div 
                                key={idx} 
                                onClick={() => onNavigate(child)}
                                className="group relative overflow-hidden rounded-lg border border-gray-200 hover:border-blue-400 hover:ring-2 hover:ring-blue-100 transition-all bg-white cursor-pointer hover:shadow-md"
                              >
                                <div className="flex h-16">
                                   <div className="w-16 flex-shrink-0 bg-gray-100 relative">
                                      <SmartImage 
                                        src={child.image} 
                                        alt={child.name} 
                                        className="w-full h-full group-hover:scale-105 transition-transform"
                                        fallbackColor={child.type === 'extinction' ? 'bg-red-100' : (child.type === 'explosion' ? 'bg-yellow-100' : 'bg-gray-200')}
                                        type={child.type}
                                      />
                                   </div>
                                   <div className="flex-1 px-3 flex flex-col justify-center">
                                      <div className="flex justify-between items-start">
                                        <span className={`font-bold text-sm flex items-center gap-1 ${child.type === 'extinction' ? 'text-red-700' : (child.type === 'explosion' ? 'text-yellow-700' : 'text-gray-800')} group-hover:text-blue-700`}>
                                          <span className="truncate max-w-[140px]">{child.name}</span>
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center mt-0.5">
                                         <span className="text-[10px] text-gray-500 font-mono truncate max-w-[100px]">
                                           {child.englishName}
                                         </span>
                                         {(child.type !== 'extinction' && child.type !== 'explosion') && (
                                           <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-1 rounded">
                                             {child.start} Ma
                                           </span>
                                         )}
                                      </div>
                                   </div>
                                   <div className="w-6 flex items-center justify-center text-gray-300 group-hover:text-blue-500">
                                      <ChevronRight size={14} />
                                   </div>
                                </div>
                              </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex-none p-6 bg-gray-50 text-center text-gray-400 text-sm border-t border-gray-100">
                        無下分層級
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
  const styles = getThemeStyles(currentTheme); 
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

  useEffect(() => {
    document.title = "地球歷史畫廊";
  }, []);

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