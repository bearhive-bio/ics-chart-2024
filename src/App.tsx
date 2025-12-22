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
        description: '哺乳動物與鳥類的時代，顯花植物興盛。',
        image: 'Cenozoic.jpg',
        children: [
          {
            id: 'quaternary',
            name: '第四紀 (Quaternary)',
            englishName: 'Quaternary',
            start: 2.58,
            end: 0,
            description: '人類出現，冰河時期循環。',
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
            description: '哺乳動物和鳥類繼續演化，早期人類祖先出現。',
            image: 'Neogene.jpg',
            children: [
              { id: 'pliocene', name: '上新世 (Pliocene)', englishName: 'Pliocene', start: 5.333, end: 2.58, image: 'Pliocene.jpg' },
              { id: 'miocene', name: '中新世 (Miocene)', englishName: 'Miocene', start: 23.03, end: 5.333, image: 'Miocene.jpg' }
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
              { id: 'oligocene', name: '漸新世 (Oligocene)', englishName: 'Oligocene', start: 33.9, end: 23.03, image: 'Oligocene.jpg' },
              { id: 'eocene', name: '始新世 (Eocene)', englishName: 'Eocene', start: 56.0, end: 33.9, image: 'Eocene.jpg' },
              { id: 'paleocene', name: '古新世 (Paleocene)', englishName: 'Paleocene', start: 66.0, end: 56.0, image: 'Paleocene.jpg' }
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
        desc: '白堊紀-古近紀滅絕：非鳥類恐龍全數滅絕，推測為主小行星撞擊導致。'
      },
      {
        id: 'mesozoic',
        name: '中生代 (Mesozoic)',
        englishName: 'Mesozoic',
        start: 251.9,
        end: 66.0,
        theme: 'cyan',
        description: '爬行動物的時代，恐龍稱霸地球。',
        image: 'Mesozoic.jpg',
        children: [
          {
            id: 'cretaceous',
            name: '白堊紀 (Cretaceous)',
            englishName: 'Cretaceous',
            start: 145.0,
            end: 66.0,
            description: '恐龍多樣化達到頂峰，顯花植物出現。',
            image: 'Cretaceous.jpg',
            children: []
          },
          {
            id: 'jurassic',
            name: '侏羅紀 (Jurassic)',
            englishName: 'Jurassic',
            start: 201.3,
            end: 145.0,
            description: '巨型恐龍（如蜥腳類）繁盛，始祖鳥出現。',
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
            desc: '三疊紀-侏羅紀滅絕：鱷類近親與大型兩棲類滅絕，為恐龍稱霸鋪路。'
          },
          {
            id: 'triassic',
            name: '三疊紀 (Triassic)',
            englishName: 'Triassic',
            start: 251.9,
            end: 201.3,
            description: '第一批恐龍與哺乳動物出現，盤古大陸形成。',
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
        desc: '二疊紀-三疊紀滅絕 (大死亡)：地球史上最嚴重滅絕，超過90%海洋物種消失。'
      },
      {
        id: 'paleozoic',
        name: '古生代 (Paleozoic)',
        englishName: 'Paleozoic',
        start: 538.8,
        end: 251.9,
        theme: 'orange',
        description: '生命大爆發至二疊紀大滅絕。',
        image: 'Paleozoic.jpg',
        children: [
          {
            id: 'permian',
            name: '二疊紀 (Permian)',
            englishName: 'Permian',
            start: 298.9,
            end: 251.9,
            description: '盤古大陸聚合，羊膜動物擴散。',
            image: 'Permian.jpg',
            children: []
          },
          {
            id: 'carboniferous',
            name: '石炭紀 (Carboniferous)',
            englishName: 'Carboniferous',
            start: 358.9,
            end: 298.9,
            description: '巨大的煤炭森林，昆蟲巨大化。',
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
            desc: '晚泥盆紀滅絕：主要影響海洋生物，尤其是造礁生物（F-F 事件）。'
          },
          {
            id: 'devonian',
            name: '泥盆紀 (Devonian)',
            englishName: 'Devonian',
            start: 419.2,
            end: 358.9,
            description: '魚類時代，第一批四足動物登陸。',
            image: 'Devonian.jpg',
            children: []
          },
          {
            id: 'silurian',
            name: '志留紀 (Silurian)',
            englishName: 'Silurian',
            start: 443.8,
            end: 419.2,
            description: '維管束植物出現，頜魚類演化。',
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
            desc: '奧陶紀-志留紀滅絕：因冰河期導致海平面下降，85%海洋物種滅絕。'
          },
          {
            id: 'ordovician',
            name: '奧陶紀 (Ordovician)',
            englishName: 'Ordovician',
            start: 485.4,
            end: 443.8,
            description: '海洋無脊椎動物繁盛。',
            image: 'Ordovician.jpg',
            children: []
          },
          {
            id: 'cambrian',
            name: '寒武紀 (Cambrian)',
            englishName: 'Cambrian',
            start: 538.8,
            end: 485.4,
            description: '寒武紀大爆發，大多數動物門類出現。',
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
                    【寒武紀大爆發：生命史上的演化煙火秀】
                    </span>
                    <span className="block leading-relaxed">
                    大約 5.4 億年前，地球海洋上演了一場名為「寒武紀大爆發」的生物狂歡。在相對極短的時間內，生命從簡單柔軟的形態，迅速演化出擁有堅硬外殼與骨骼（礦化組織）的複雜物種。這不僅大幅提升了生物多樣性，更奠定了幾乎所有現代動物——包括人類——的身體基本藍圖（門）。透過加拿大伯吉斯頁岩與中國澄江生物群的珍貴化石，我們得以見證這段「演化創意大爆發」的壯麗時刻，它是地球生命最關鍵的轉捩點。
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
    description: '氧氣累積，真核生物出現。分為古元古代、中元古代、新元古代。',
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
    description: '最古老的岩石與單細胞生命形式。分為始太古代、古太古代、中太古代、新太古代。',
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
    description: '地球形成初期，熔岩表面，無地質記錄保存。',
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