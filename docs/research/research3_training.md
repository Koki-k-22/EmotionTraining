
# 共感反射（empathic reflection）のトレーニングと「深さ」の評価手法

## 0. エグゼクティブ・サマリー

調査から得られる最も重要な結論は、共感応答の質を単一の「深さ」だけで測るべきではない、という点である。

既存モデルには、おおむね次の共通構造がある。

1. 相手の発話を無視・否定する  
2. 話題や事実だけを繰り返す  
3. 明示された感情・意味を正確に言い換える  
4. 暗黙の感情・意味を、根拠のある仮説として付け加える  
5. 複数の感情、価値、願い、葛藤を統合して返す  

ただし、深い内容を言えば常に高評価になるわけではない。Carkhuff、MITI、empathic accuracy 研究のいずれでも、「相手の経験に合っていること」が前提である。たとえば「ムカついた」に対して「プライドが傷ついたんですね」は深い可能性がある一方、文脈がなければ過剰解釈にもなる。

したがって、アプリでは最低限、以下を分離すべきである。

- **反射の深さ**：表面的な言い換えか、暗黙の感情・意味まで扱っているか
- **的確さ**：その推測が発話・状況・模範設定と整合しているか
- **応答の安全性**：断定、評価、説教、助言、話題転換になっていないか

オフラインPWAでLLMを使えない場合、完全自動採点は難しい。現実的には、シナリオ別の感情・意味・価値語辞書による「採点候補」と、模範解答を見た後の自己採点を組み合わせる方式が適している。

---

# 1. 概念整理

本レポートでいう「共感反射」は、相手の発話内容を繰り返すだけでなく、その人が経験している感情、意味、価値、願い、葛藤などを理解し、それを言語化して返す行為を指す。

関連概念は区別する必要がある。

| 概念 | 主に測るもの |
|---|---|
| 感情の反映 | 相手が表明・示唆した感情を言葉にして返す |
| 内容の言い換え・paraphrase | 発話の事実的内容を別の言葉で返す |
| complex reflection | 発話に含まれる意味・強調・暗黙内容を加えた反射 |
| 共感的理解 | 相手の視点や経験世界を理解し、伝えること |
| empathic accuracy | 推測した内心が、本人の自己報告とどの程度一致するか |
| 共感的関心・compassion | 相手を気遣い、助けたいという情動・動機 |
| perceived empathy | 相手が「理解された」と感じた程度 |

特に、**「深そうな表現」と「内心を正しく捉えた表現」は同じではない**。近年は empathic accuracy という名称についても、正確な内心推測は必ずしも親切・援助的行動を意味しないとして、thought-feeling accuracy や inferential accuracy と呼ぶ議論がある。[Hodges et al. のレビュー](https://pmc.ncbi.nlm.nih.gov/articles/PMC10890342/)

---

# 2. カウンセラー養成における共感訓練

## 2.1 Iveyのマイクロカウンセリング

Iveyのマイクロカウンセリングは、面接を小さな観察可能スキルに分解し、短い説明、モデル提示、実演、録画、フィードバック、再実演を通じて習得させる方法である。初期研究では、attending behavior、reflection of feeling、summarization of feelingなどが個別の訓練対象とされた。[Ivey, 1968, ERIC](https://eric.ed.gov/?id=ED021275)

主要な区別は次のように整理できる。

| スキル | 概要 |
|---|---|
| Attending behavior | 視線、姿勢、声、発話追随などによって、相手に注意を向ける |
| Encourager | 「うん」「それで」などで語りを促す |
| Paraphrase | 相手が述べた内容を簡潔に言い換える |
| Reflection of feeling | 感情を選び取り、言葉にして返す |
| Summarization of feeling | 複数の発言を、中心的な感情やテーマとしてまとめる |
| Reflection of meaning | 感情だけでなく、その出来事が本人にとって持つ意味を返す |

初期の解説では、感情の反映は、対話の一側面、特に感情に選択的に注意を向けるattending behaviorとして説明されている。また感情の要約では、分散した発言を中心的テーマや感情に統合することが求められる。[Ivey関連ERIC資料](https://files.eric.ed.gov/fulltext/ED036471.pdf)

アプリ設計上は、自由記述をいきなり「深い共感」に誘導するより、

1. 内容を言い換える  
2. 明示された感情を反映する  
3. 暗黙の感情を反映する  
4. 感情と意味を統合する  

というマイクロスキル分解が適している。

---

## 2.2 Truax / Carkhuffの共感尺度

### 尺度の成立

Truaxらの Accurate Empathy Scale はもともと9段階で、録音・観察された心理療法場面について、治療者がクライエントの感情をどの程度正確に捉え、伝えているかを第三者が評定する尺度だった。最低段階は明白な感情にも気づいていない状態、最高段階は感情の全範囲と強度に精密に応答する状態とされる。[Truax尺度の概説](https://pure.roehampton.ac.uk/portal/files/4543964/A_psychometric_evaluation_of_the_Barrett_Lennard_Relationship_Inventory_Obs_40_Version_3_in_humanistic_counselling_for_young_people.pdf)

Carkhuffは1969年、これを5段階に短縮し、次の三領域を明確にした。

- **Subtractive response**：相手が表現した感情・意味を減らす
- **Interchangeable response**：相手の表現とほぼ交換可能な正確な反射
- **Additive response**：暗黙の感情・意味を、正確に付け加える

5段階化は評定の曖昧さを減らし、評定者間信頼性を高める意図があったとされる。[NIHRによる尺度レビュー](https://njl-admin.nihr.ac.uk/document/download/2001563)

### Carkhuffの5段階

| 段階 | 原モデルの趣旨 | アプリ向けの平易な解釈 |
|---|---|---|
| 1 | 相手の表現に注意を向けない、または大きく損なう | 無視、否定、説教、無関係な返答 |
| 2 | 一部には反応するが、相手が表した感情・意味を目立って減らす | 事実だけ拾う、感情を弱める、感情を取り違える |
| 3 | 相手が明示した内容・感情とほぼ交換可能 | 表面感情を正確に言い換える |
| 4 | 暗黙の感情・意味を妥当な範囲で付け加える | 言外の傷つき、不安、葛藤などを仮説として返す |
| 5 | 表面・深層の感情、意味、強度、パターンを包括的・精密に返す | 感情＋意味＋価値・願いを文脈に即して統合する |

要約すると、レベル3が「最低限促進的な水準」であり、3未満は減算的、3を超える反応は加算的とされる。レベル4は「目立って付け加える」、レベル5は感情と意味を「大きく、しかも正確に付け加える」水準である。[Carkhuff尺度の要約](https://api.pageplace.de/preview/DT0400.9781135894443_A23810260/preview-9781135894443_A23810260.pdf)

重要なのは、additiveが「想像力豊かに話を作ること」ではなく、**相手の表現に根差した正確な付加**だという点である。

---

# 3. Motivational InterviewingとMITI

## 3.1 Simple reflectionとComplex reflection

MITI 4.2.1では、反射はクライエントが述べたものを捉えて返す発言であり、simple reflectionとcomplex reflectionに分けられる。

| 区分 | MITIの基準 |
|---|---|
| Simple Reflection | クライエントの発言に、意味や強調をほとんど付け加えない |
| Complex Reflection | 発言に相当量の意味や強調を加え、より深い・複雑な理解を提示する |

Simple reflectionは、強い感情を明確に命名する場合もあるが、クライエントの元の発言から大きく先には進まない。Complex reflectionは、暗黙の意味を加える、特定の側面を強調する、複数発言を方向性のある形で統合する、といった特徴を持つ。[MITI 4.2.1, pp. 21–22](https://casaa.unm.edu/assets/docs/miti4_2.pdf)

MITIマニュアルの例は次のようなものである。

- 「三度目のスピード違反で腹が立つ」  
  - Simple：「ものすごく腹が立っているんですね」  
  - Complex：「これでもう我慢の限界なんですね」

- 「母が自立したいと言うのに、何度も電話してくる」  
  - Simple：「お母さんとのことで、とてもストレスを感じているんですね」  
  - Complex：「お母さんが本当は何を望んでいるのか、分からなくなっているんですね」

判断が難しい場合はsimple reflectionに分類する、という保守的な決定規則もある。

## 3.2 MITIのセッション全体の共感評定

MITIでは個々の反射だけでなく、面接全体のEmpathyを1～5で評定する。

| 段階 | MITIのEmpathy global rating |
|---|---|
| 1 | クライエントの視点にほとんど注意を向けない |
| 2 | 散発的に理解を試みるが、不正確または浅い |
| 3 | 積極的に理解しようとし、ある程度成功する |
| 4 | 繰り返し正確に理解を示すが、主に明示的内容にとどまる |
| 5 | 明示された内容に加え、まだ言われていない意味まで深く理解する |

高い評定には、正確なcomplex reflection、以前の発話に基づく洞察的質問、感情状態の正確な理解などが含まれる。一方、MITIは共感を、同情、温かさ、支持、受容などと区別している。[MITI 4.2.1, Empathy scale](https://casaa.unm.edu/assets/docs/miti4_2.pdf)

## 3.3 MITIの集計指標

MITIでは次の指標も計算される。

- Complex Reflection比率  
  `CR / (SR + CR)`
- Reflection-to-Question Ratio  
  `総反射数 / 総質問数`

MITI 4.2.1が示した専門家判断ベースの目安は、complex reflection比率が「Fair 40%」「Good 50%」、反射対質問比が「1:1」「2:1」である。ただしマニュアル自身が、これらの閾値には規範・妥当性データが十分でないと注意している。[MITI集計指標](https://casaa.unm.edu/assets/docs/miti4_2.pdf)

短い一問一答型アプリでは、セッション全体のMITI評定をそのまま流用するのは適切でない。simple/complexの区別を、回答単位の教材設計に借用するのが妥当である。

---

# 4. 共感応答の「深さ」を段階評価するルーブリック実例

## 4.1 Helpful Responses Questionnaire（HRQ）

HRQは、6つの仮想クライエント発言に対して「助けになろうとするなら次に何と言うか」を自由記述させる短い測定法である。各回答を、反射の深さとcommunication roadblockの有無によって1～5点で採点する。[Miller, Hedrick & Orlofsky, 1991](https://onlinelibrary.wiley.com/doi/abs/10.1002/1097-4679%28199105%2947%3A3%3C444%3A%3AAID-JCLP2270470320%3E3.0.CO%3B2-U)

| 点 | HRQの基準 |
|---|---|
| 1 | 反射がなく、説教・助言・評価などのroadblockがある |
| 2 | 反射とroadblockが混在する、またはどちらもない |
| 3 | 発言内容をそのまま繰り返す |
| 4 | 妥当な推論的意味を加えて言い換える |
| 5 | 4点を満たし、適切な感情反映または比喩を含む |

実際の採点票も公開されている。[HRQ scoring sheet](https://www.institutebestpractices.org/wp-content/uploads/2021/04/16c.-HRQ.pdf)

HRQは今回のアプリにかなり近い形式である。ただし、原尺度は訓練された人間評定者が回答全体の意味を判断するため、単語一致だけで同等の妥当性を再現できるわけではない。

---

## 4.2 Empathic Communication Coding System（ECCS）

ECCSは、患者が感情、困難、進展を示す「empathic opportunity」を特定し、医療者の応答を分類する。

| レベル | 名称 | 定義 |
|---|---|---|
| 0 | Denial/disconfirmation | 無視、否定、即時の話題変更 |
| 1 | Perfunctory recognition | 自動的・儀礼的な相づち |
| 2 | Implicit recognition | 周辺的内容には反応するが、中心的問題を明示的に扱わない |
| 3 | Acknowledgment | 中心的な問題を明示的に認める |
| 4 | Pursuit | 中心的問題を認め、質問、支持、詳述などでさらに扱う |
| 5 | Confirmation | その感情・困難・進展がもっともであると正当化する |
| 6 | Shared feeling/experience | 自分にも同じ感情・経験があると自己開示する |

[Bylund & Makoul, 2005のECCS表](https://www.researchgate.net/publication/7677496_Examining_Empathy_in_Medical_Encounters_An_Observational_Study_Using_the_Empathic_Communication_Coding_System)

注意点として、ECCSは数字が大きいほど常に望ましいという規範的序列ではない。特に自己開示を含むレベル6が、常にレベル5より良いとはされていない。したがって、アプリの「深さ得点」として0～6をそのまま使うべきではない。

---

## 4.3 段階モデルの比較

| モデル | 浅い側 | 中間 | 深い側 | 的確さの扱い |
|---|---|---|---|---|
| Truax 9段階 | 明白な感情にも気づかない・不正確 | 現在の感情をある程度捉える | 感情の全範囲・強度、暗黙内容を精密に捉える | 中核要件 |
| Carkhuff 5段階 | 無視・減算 | 明示内容と交換可能な反射 | 暗黙の感情・意味を加算 | 「正確な付加」が必要 |
| MITI反射コード | simple：意味をほぼ加えない | ― | complex：意味・強調を相当量加える | 文脈に適合する必要 |
| MITI共感1～5 | 視点への注意がない | 理解を試み、部分的に成功 | まだ言われていない意味まで深く理解 | 正確な反射が高評価条件 |
| HRQ 1～5 | roadblock、反射なし | 内容の繰り返し | 推論的意味＋感情または比喩 | 「妥当・もっともらしい」推論 |
| EPITOME | 各機構なし | 弱い表現 | 感情・経験を具体的に明示 | seekerの文脈を入力に使用 |
| ECCS | 無視・儀礼的反応 | 中心課題の承認 | 追究・正当化・自己開示 | 主に応答形式の分類 |
| Ickes | ― | ― | 深さ尺度ではない | 本人の内心報告との一致を直接評価 |

---

# 5. Empathic Accuracy研究

## 5.1 Ickesらの基本パラダイム

Ickesらの方法では、一般に次の手順を取る。

1. ターゲットとなる人の会話や語りを録画する  
2. 本人が録画を見返す  
3. 特定の停止点で、その瞬間に考えていたこと・感じていたことを自由記述する  
4. 知覚者が同じ録画を同じ停止点で見る  
5. 知覚者が、ターゲットの思考・感情を推測して記述する  
6. 独立評定者が、本人の記述と推測の内容的一致を採点する  

標準刺激法では録画時の対話に参加していない第三者が推測し、dyadic interaction法では対話相手が推測する。[Ickes法のレビュー](https://pmc.ncbi.nlm.nih.gov/articles/PMC10890342/)

典型的には、次のような3段階または4段階の一致評定が使われる。

- 0：内容が本質的に異なる
- 1：一部が似ている
- 2：大部分または本質的内容が一致する

これを複数停止点について合計・平均する。別系統の方法では、ターゲットと知覚者が感情価を連続ダイヤルで評価し、その時系列相関または差をaccuracyとする。

## 5.2 アプリへの示唆

この研究が示すのは、共感の的確さを本当に評価するには、**正解基準となる本人の内心報告**が必要だということである。

したがって、教材シナリオを作る際には、表示される発話だけでなく、制作者側で次を保持するとよい。

```text
表示発話:
「みんなの前でそんな言い方しなくてもいいのに。マジでムカついた」

明示感情:
怒り、苛立ち

内心設定:
恥ずかしかった、軽く扱われた、面子を潰された

価値・願い:
尊重されたい、人前では配慮してほしい

許容される深い反射:
「人前で軽く扱われたようで、傷ついたんですね」
「腹が立っただけでなく、恥をかかされた感じもしたんですね」

許容度が低い推測:
見捨てられ不安、罪悪感、嫉妬
```

「ムカついた」だけを提示して「プライドが傷ついた」を唯一の正解にするのは、empathic accuracyの観点では根拠不足である。前後の状況を十分提示するか、複数の妥当な深層感情を正解集合に含める必要がある。

---

# 6. デジタル・AIによる訓練と評価

## 6.1 仮想患者・シミュレーション

医療教育では、仮想患者がempathic opportunityを提示し、学習者の応答をECCSなどで評価する研究が行われている。70名の医学生を対象とした研究では、即時の共感フィードバックを返す仮想患者を含む条件が検討された。[Foster et al., 2016](https://augusta.elsevierpure.com/en/publications/using-virtual-patients-to-teach-empathy-a-randomized-controlled-s/)

MPathic-VRは、患者・医療者間および専門職間の共感的コミュニケーションを訓練する仮想人間システムである。3医学校206名を対象とした研究では、介入群のOSCEコミュニケーション得点が対照群より有意に高かったと報告されている。[Kron et al. / MPathic-VR研究](https://pmc.ncbi.nlm.nih.gov/articles/PMC6906619/)

これらは、次の訓練原則を支持する。

- 感情表明が起きる「採点機会」を明確にする
- その直後の応答を評価する
- 応答ごとの即時フィードバックを返す
- 模範表現だけでなく、なぜそれがよいかを示す
- 繰り返し練習し、別シナリオへの転移を確認する

## 6.2 EPITOME

EPITOMEは、テキストベースのピアサポートにおける表出された共感を、次の3機構に分解する。

| 機構 | 0 | 1：弱い | 2：強い |
|---|---|---|---|
| Emotional Reactions | 温かさ・心配の表現なし | 間接的な気遣い | 感じた心配・悲しみ等を明示 |
| Interpretations | 理解の表現なし | 「気持ちは分かる」等の一般表現 | 推測した具体的感情・経験を明示 |
| Explorations | 探索なし | 「何があったの？」等の一般質問 | 特定の感情・経験を焦点化して探索 |

たとえばInterpretationsでは、「分かります」は弱い表現、「それは恐ろしかったでしょう」は強い表現とされる。Explorationsでは、「何があったの？」より「今、ひとりぼっちだと感じていますか？」のほうが具体的である。[Sharma et al., 2020, EPITOME](https://aclanthology.org/2020.emnlp-main.425.pdf)

同研究は約1万件の投稿・応答ペアを注釈し、文脈を入力するRoBERTaベースモデルを用いて、約80%のaccuracy、約70%のmacro-F1を報告した。ただし、一般化表現を強い解釈と誤認する、感情探索ではない質問を探索と誤認する、といった誤りも報告されている。

これは、単純なキーワード採点にはさらに大きな限界があることを意味する。

- 「悲しい」という語があっても、相手の感情とは限らない
- 「分かる」という語があっても、具体的理解とは限らない
- 疑問形でも、感情探索とは限らない
- 同じ語が文脈によって適切にも不適切にもなる

したがって、単語一致は最終得点ではなく、**自己採点を支える検出信号**として使うべきである。

---

# 7. 日本国内の実践

## 7.1 産業カウンセラー養成

日本産業カウンセラー協会の養成講座では、カウンセラー役・相談者役・観察者役を経験する104時間の「面接の体験学習」、逐語記録の作成と検討、傾聴の意義と技法などが含まれる。[日本産業カウンセラー協会・講座概要](https://www.counselor.or.jp/Default.aspx?TabId=133)

修了要件には、面接の体験学習に関する課題をABCDの4段階で評価する仕組みがある。ただし、公開資料からは、個々の共感応答をCarkhuff型の深さとして採点する詳細基準までは確認できない。

確認できる実践上の特徴は以下である。

- ロールプレイ
- カウンセラー・相談者・観察者の役割交代
- 逐語記録
- 指導者による振り返り
- 相手が感情や思いを理解し、自ら決断できるよう支援する態度の習得

## 7.2 キャリアコンサルタント

国家資格キャリアコンサルタントの実技試験では、面接が「態度」「展開」「自己評価」などの区分で評価される。[キャリアコンサルタント試験FAQ](https://www.career-shiken.org/faq/14483/)

国内制度では、傾聴・共感的理解は相談関係を作り、相談者の自己理解を支える基盤として位置づけられる一方、公開されている試験情報は面接全体の遂行評価が中心である。単一の自由記述応答について、「表面感情」「暗黙の感情」「意味」という段階を詳細採点するものではない。

## 7.3 看護・医学教育

国内の看護教育では、患者役・看護師役・観察者役を交代するロールプレイ、レポート、自己評価尺度などが使われている。苦悩を抱える患者を想定した看護学生のロールプレイ研究では、3役の体験を通じて、患者を支えるコミュニケーション方法と自己の姿勢・力量についての学びが形成された。[喜多下・糸島・小野, 2019](https://www.jstage.jst.go.jp/article/jane/29/1/29_1/_article/-char/ja/)

医療面接教育では、模擬患者、OSCE、教員評価、録画レビュー、模擬患者からのフィードバックが用いられる。日本の医学生を対象にした研究では、模擬患者が評価した「学生が共感を表すフレーズを使った」が、面接全体を共感的だと感じることの独立した予測因子だった。[Kataoka et al.関連研究](https://pmc.ncbi.nlm.nih.gov/articles/PMC10712511/)

一方、日本のOSCE研究では、「どのくらいできたか」という質的評定は評価者間差が大きく、「した／しなかった」という行動チェックは比較的ばらつきが小さかった。評価基準を具体的にする必要が指摘されている。[OSCE医療面接評価の問題点](https://www.jstage.jst.go.jp/article/mededjapan1970/32/4/32_4_231/_article/-char/ja/)

国内実践からの示唆は、次の通りである。

- 自動得点だけより、相談者役・患者役の主観的フィードバックが重要
- 「深く共感できたか」という一項目より、観察可能な行動に分解したほうが安定する
- 逐語記録と自己振り返りは、オフラインPWAにも取り入れやすい
- 国内教育では応答単位の深さ尺度より、面接全体、態度、自己評価、模擬患者評価が中心である

---

# 8. アプリ用ルーブリック案

以下は既存尺度そのものではなく、Carkhuff、MITI、HRQ、EPITOME、empathic accuracyを統合した**設計提案**である。

## 8.1 推奨する5段階

| 得点 | 名称 | 判定基準 | 例：「みんなの前で言われてムカついた」 |
|---:|---|---|---|
| 0 | 非共感・阻害 | 否定、評価、説教、助言、話題転換、決めつけ | 「気にしすぎだよ」 |
| 1 | 内容の追随 | 出来事を繰り返すが感情を扱わない | 「みんなの前で言われたんですね」 |
| 2 | 表面感情の反映 | 明示された感情を正確に命名・言い換える | 「すごく腹が立ったんですね」 |
| 3 | 暗黙感情・意味の反映 | 文脈から妥当な感情・意味を一つ推測し、仮説として返す | 「人前で軽く扱われたようで、傷ついたんですね」 |
| 4 | 統合的な深い反映 | 表面感情と、その下の感情・意味・価値・願いを簡潔に統合する | 「腹が立つと同時に、人前では尊重してほしかったのに、面子を傷つけられた感じだったんですね」 |

### 得点の上限規則

- 暗黙感情語があっても、シナリオ設定と不整合なら最大2点
- 断定的・侵襲的な決めつけがある場合は1段階下げる
- 助言、説教、評価、原因追及が混在する場合は最大2点
- 自己開示が中心になった場合は、深さ加点をしない
- 単に文章が長いことは加点理由にしない
- 感情語が複数あること自体も加点理由にしない

## 8.2 深さと的確さを別表示する方式

より望ましいのは、単一の0～4点ではなく、次の二軸を表示する方法である。

| 軸 | 0 | 1 | 2 |
|---|---|---|---|
| 反映の深さ | 内容のみ・反射なし | 明示感情 | 暗黙の感情・意味 |
| 的確さ | 不整合・決めつけ | 一部整合 | 文脈・内心設定によく整合 |
| 伝え方 | 阻害的 | 中立 | 仮説的・受容的 |

合計6点としつつ、フィードバックは「深さ2／的確さ0」のように分ける。これにより、「深いが外れた回答」を高得点にしないで済む。

---

# 9. オフラインPWAでの採点実装案

## 9.1 シナリオごとに保持するデータ

```json
{
  "surface_emotions": [
    ["怒り", "腹が立つ", "ムカつく", "苛立つ"]
  ],
  "latent_emotions": [
    ["傷つく", "ショック", "悲しい"],
    ["恥ずかしい", "惨め", "面子を潰された"]
  ],
  "meanings": [
    ["軽く扱われた", "見下された", "尊重されなかった"],
    ["人前で言われた", "恥をかかされた"]
  ],
  "needs_values": [
    ["尊重", "大切に扱ってほしい", "配慮してほしい"]
  ],
  "tentative_markers": [
    "ように感じた",
    "だったんですね",
    "なのかもしれませんね",
    "という感じでしょうか",
    "もし違ったら"
  ],
  "roadblocks": [
    "気にしすぎ",
    "忘れたほうがいい",
    "あなたも悪い",
    "こうすべき",
    "なんで",
    "普通は"
  ]
}
```

日本語では表記揺れが大きいため、NFKC正規化、ひらがな・カタカナ統一、活用語尾の簡易除去、同義語群によるマッチが必要になる。

## 9.2 自動判定は「暫定スコア」に限定する

例：

```text
+1 表面感情語がある
+1 潜在感情語がある
+1 意味・価値・願いに関する語句がある
+1 仮説的・受容的な文型がある

-1 助言・説教・評価表現がある
-1 感情を否定・矮小化する表現がある
-1 自分の経験への話題転換が中心
```

ただし、単語が出現しただけでは、その語が誰に掛かっているか、否定形か、皮肉かを判定できない。したがって画面表示は、

> 自動チェックでは「潜在感情」と「尊重されたい気持ち」が含まれていました。模範例と比べて、相手の内心に合っていると思うか確認してください。

のようにする。

「あなたの共感度は92点」といった精密に見える表示は避けたほうがよい。

## 9.3 自己採点項目

回答後、以下をチェックさせる。

- 相手が実際に言った内容だけでなく、感情を言葉にした
- その感情は、状況から無理なく推測できる
- 怒りの下にある傷つき・不安・恥・願いなどを考えた
- 相手が訂正できるような言い方にした
- 助言、評価、説教、自分語りにすり替えていない
- 模範解答と違っても、同じ内心設定を捉えている

## 9.4 模範解答は複数提示する

一つだけ示すと「正解文の暗記」になりやすい。

推奨構成：

- 表面反射の例
- deep reflectionの例を2～4個
- 深すぎる／外れた解釈の例
- 助言に逸れた例
- 模範例が捉えている「感情・意味・価値」のタグ

---

# 10. Deep reflectionの文型パターン

文型はそれ自体が深さを保証するものではない。深さは、空欄に入る感情・意味が文脈に根差しているかで決まる。

## 10.1 明示感情の反映

- 「かなり〜と感じたんですね」
- 「それだけ〜だったんですね」
- 「〜という気持ちが強かったんですね」
- 「本当に〜だったことが伝わってきます」

## 10.2 表面感情の下にある感情

- 「腹が立ったというより、むしろ〜だったんですね」
- 「怒りの奥には、〜という気持ちもあったんですね」
- 「〜されたようで、傷ついたんですね」
- 「強く言いたくなるくらい、〜だったんですね」
- 「本当は〜になるのが怖かったんですね」

## 10.3 出来事が本人に持つ意味

- 「それは、あなたにとって〜という意味だったんですね」
- 「単に〜ということではなく、〜と受け取ったんですね」
- 「〜されたことで、自分を〜と扱われたように感じたんですね」
- 「その言葉が、〜を否定されたように聞こえたんですね」

## 10.4 価値・願い・ニーズ

- 「本当は、〜してほしかったんですね」
- 「あなたにとって、〜であることが大切だったんですね」
- 「〜を大事にしてきたからこそ、余計に〜だったんですね」
- 「責めたいというより、〜を分かってほしかったんですね」
- 「きちんと尊重してもらいたかったんですね」

## 10.5 葛藤・両価性

- 「〜したい気持ちと、〜したくない気持ちの間で揺れているんですね」
- 「嬉しい反面、〜という不安もあるんですね」
- 「離れたいけれど、同時に〜も失いたくないんですね」
- 「納得しようとしている一方で、まだ〜が残っているんですね」

## 10.6 時間的・累積的意味

- 「今回のことだけでなく、これまでの〜も重なっているんですね」
- 「ずっと我慢してきたものが、ここで限界になったんですね」
- 「以前にも似たことがあったから、今回は特に〜だったんですね」

## 10.7 仮説性を保つ表現

- 「もしかすると、〜という感じもあったのでしょうか」
- 「〜だったように聞こえました」
- 「もし違っていたら教えてほしいのですが、〜だったのでしょうか」
- 「〜ということなのかもしれませんね」
- 「〜と感じた部分もありそうですね」

ただし、すべてを疑問形にすると質問になり、反射の練習から外れやすい。基本は穏やかな叙述形を使い、確信度が低い場合だけ訂正可能性を付けるのがよい。

---

# 11. 推奨する教材設計

最初からレベル4だけを求めるのではなく、段階別の課題にする。

1. **表面感情を探す**  
   発話中の感情を一語で選ぶ。

2. **表面反射を書く**  
   明示感情を言い換える。

3. **下にある感情を複数考える**  
   傷つき、不安、恥、悲しみ、孤独などから候補を出す。

4. **根拠を確認する**  
   どの発話・状況がその推測を支えているか選ぶ。

5. **deep reflectionを書く**  
   潜在感情または意味を一つ返す。

6. **模範例と比較する**  
   文言ではなく、感情・意味・価値タグを比較する。

7. **本人役フィードバックを読む**  
   「そのとき本当は、皆の前で能力がないと思われたことが恥ずかしかった」などを表示する。

この手順は、単なる言い回しの暗記ではなく、Ickes型の「本人の内心を基準にした的確さ」の学習につながる。

---

# 12. 限界と注意事項

- CarkhuffやTruaxの尺度は、訓練された第三者が対話全体や応答を意味的に判断する尺度であり、キーワード採点用に開発されたものではない。
- MITIのcomplex reflectionは、必ずしも感情の深掘りだけを意味しない。意味の追加、強調、方向づけ、両面反射、要約なども含む。
- ECCSの数字は、単純な優劣順位として使えない。
- empathic accuracyにおける「正解」は本人の自己報告だが、本人の自己理解も完全な客観的真実ではない。
- 自由記述の深さを単語一致だけで確定することはできない。
- 自己採点には寛大化・厳格化などのバイアスがあるため、学習用途には適していても、資格認定や能力選抜には不十分である。
- 「深い反射」を過度に奨励すると、決めつけ、心理分析、トラウマの推定などを強化する危険がある。
- 低文脈の短い発話では、深い推測より表面感情の正確な反映のほうが適切な場合がある。

---

# 13. 出典リスト

## 国外文献・マニュアル

1. Ivey, A. E. “Micro-Counseling and Attending Behavior: An Approach to Pre-Practicum Counselor Training.” 1968.  
   [ERIC](https://eric.ed.gov/?id=ED021275)

2. Truax, C. B., & Carkhuff, R. R. *Toward Effective Counseling and Psychotherapy: Training and Practice.* 1967.  
   [尺度の後続的解説](https://pure.roehampton.ac.uk/portal/files/4543964/A_psychometric_evaluation_of_the_Barrett_Lennard_Relationship_Inventory_Obs_40_Version_3_in_humanistic_counselling_for_young_people.pdf)

3. Carkhuff, R. R. *Helping and Human Relations / Empathic Understanding in Interpersonal Processes: A Scale for Measurement.* 1969.  
   [NIHR尺度レビュー](https://njl-admin.nihr.ac.uk/document/download/2001563)

4. Moyers, T. B., Manuel, J. K., & Ernst, D. *Motivational Interviewing Treatment Integrity Coding Manual 4.2.1.* 2015.  
   [MITI 4.2.1 PDF](https://casaa.unm.edu/assets/docs/miti4_2.pdf)

5. Miller, W. R., Hedrick, K. E., & Orlofsky, D. R. “The Helpful Responses Questionnaire: A Procedure for Measuring Therapeutic Empathy.” 1991.  
   [Journal of Clinical Psychology](https://onlinelibrary.wiley.com/doi/abs/10.1002/1097-4679%28199105%2947%3A3%3C444%3A%3AAID-JCLP2270470320%3E3.0.CO%3B2-U)  
   [採点票](https://www.institutebestpractices.org/wp-content/uploads/2021/04/16c.-HRQ.pdf)

6. Bylund, C. L., & Makoul, G. “Empathic Communication and Gender in the Physician–Patient Encounter.” 2002.  
   [Patient Education and Counseling PDF](https://each.international/wp-content/uploads/2023/05/Bylund-Makoul-2002-Empathic-Communication-and-Gender-in-the-Physician-Patient-Education-Counseling.pdf)

7. Bylund, C. L., & Makoul, G. “Examining Empathy in Medical Encounters: An Observational Study Using the Empathic Communication Coding System.” 2005.  
   [論文・ECCS表](https://www.researchgate.net/publication/7677496_Examining_Empathy_in_Medical_Encounters_An_Observational_Study_Using_the_Empathic_Communication_Coding_System)

8. Ickes, W. et al. Empathic accuracy / unstructured dyadic interaction paradigm. 1990以降。  
   [Hodges et al.による測定法レビュー](https://pmc.ncbi.nlm.nih.gov/articles/PMC10890342/)  
   [Ickes, “Measuring Empathic Accuracy,” 2001](https://www.researchgate.net/publication/275657515_Measuring_empathic_accuracy)

9. Sharma, A., Miner, A. S., Atkins, D. C., & Althoff, T. “A Computational Approach to Understanding Empathy Expressed in Text-Based Mental Health Support.” 2020.  
   [ACL Anthology / EMNLP](https://aclanthology.org/2020.emnlp-main.425.pdf)

10. Foster, A. et al. “Using Virtual Patients to Teach Empathy: A Randomized Controlled Study to Enhance Medical Students’ Empathic Communication.” 2016.  
    [研究概要](https://augusta.elsevierpure.com/en/publications/using-virtual-patients-to-teach-empathy-a-randomized-controlled-s/)

11. MPathic-VR研究チーム. “Medical Students’ Experiences and Outcomes Using a Virtual Human Simulation to Improve Communication Skills.” 2019.  
    [JMIR / PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC6906619/)

12. Patel, S. et al. “Curricula for Empathy and Compassion Training in Medical Education: A Systematic Review.” 2019.  
    [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC6705835/)

## 日本国内

13. 一般社団法人日本産業カウンセラー協会「産業カウンセラー養成講座」2026年度公開情報。  
    [講座概要](https://www.counselor.or.jp/Default.aspx?TabId=133)  
    [講座紹介](https://www.counselor.or.jp/portals/0/e-learning/index.html)

14. 厚生労働省「キャリアコンサルタント養成講習」およびキャリアコンサルタント制度。  
    [制度概要](https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/jinzaikaihatsu/career_consultant01.html)

15. 喜多下真里・糸島陽子・小野あゆみ「苦悩を抱える患者を想定したロールプレイングにより得られたコミュニケーションに関する看護学生の学び」2019年。  
    [J-STAGE](https://www.jstage.jst.go.jp/article/jane/29/1/29_1/_article/-char/ja/)

16. 常住亜衣子・石川ひろの・木内貴弘「医療面接における医師・患者間コミュニケーションスキル評価尺度：文献レビューと尺度構成項目の分析」2013年。  
    [J-STAGE](https://www.jstage.jst.go.jp/article/mededjapan/44/5/44_335/_article/-char/ja/)

17. 北川元二・伴信太郎・島田康弘「OSCEの医療面接における学生模擬患者の試み」2000年。  
    [J-STAGE](https://www.jstage.jst.go.jp/article/mededjapan1970/31/4/31_4_247/_article/-char/ja/)

18. 「Assessing the Empathy of Medical Students During Medical Interview Training in Japan by Using Mixed-Methods Surveys of Simulated Patients」2019年。  
    [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10712511/)

19. 「客観的臨床能力試験（OSCE）における医療面接評価の問題点」2001年。  
    [J-STAGE](https://www.jstage.jst.go.jp/article/mededjapan1970/32/4/32_4_231/_article/-char/ja/)

---

## 最終提案

このアプリでは、名称を単純な「共感度」ではなく、次のようにすると構成概念が明確になる。

> **共感反射スコア**  
> 相手の発話から感情・意味を捉え、それを受容的に言葉にして返す練習の指標

推奨表示は、

```text
反映の深さ：2 / 2
文脈との一致：1 / 2
受容的な伝え方：2 / 2
合計：5 / 6

潜在感情には触れられています。
ただし「プライドが傷ついた」は少し断定的かもしれません。
「人前で軽く扱われたようで、傷ついたんですね」のように、
出来事とのつながりを示すと、相手が確認・訂正しやすくなります。
```

という形が適している。これなら、オフラインの語句マッチで補助判定しつつ、既存研究が重視する「深さ・的確さ・伝え方」を混同せずに扱える。