# 概率演化与生成动力学

**自回归、扩散、流与联合生成的统一数学** —— 一部纯理论著作。

> 只讲理论与数学：每个概念先给定义，每个命题先列假设，每个定理给证明或完整证明思路，
> 每个公式给出推导链，每章末给出反例与边界；192 节代码实验室只作为公式的可执行校验。

在线阅读：<https://zhangjianbang-nb.github.io/generative-modeling-theory/>

## 结构

| 部 | 主题 | 章 | 节 |
|---|---|---|---|
| 第一部 | 自回归生成：概率分解与序列动力学 | 24 | 384 |
| 第二部 | 扩散生成：随机过程与得分动力学 | 24 | 384 |
| 第三部 | 流生成：测度传输与速度动力学 | 24 | 384 |
| 第四部 | 联合生成：联合概率结构与统一框架 | 24 | 384 |

四部 × 24 章 × 16 节 = **1536 节**。每章 13 节理论、1 节反例与边界、2 节代码实验室（全书 192 节代码）。

## 统一骨架

四种生成范式共享同一个对象：概率测度随时间的演化 $\mu_t$。

- 自回归把它写成离散条件链 $p(x)=\prod_i p(x_i\mid x_{<i})$；
- 扩散写成随机微分方程与 Fokker–Planck 方程；
- 流写成连续性方程 $\partial_t p_t+\nabla\cdot(p_tv_t)=0$；
- 联合生成写成耦合测度的传输与因子化误差。

三条恒等式贯穿全书，且**不可互相替代**：

$$
\partial_t p_t=-\nabla\cdot(p_t f)+\tfrac12 g^2\Delta p_t
$$

$$
dX_t=\left[f-g^2\nabla\log p_t\right]dt+g\,d\bar W_t
$$

$$
\dot x_t=f-\tfrac12 g^2\nabla\log p_t,\qquad \partial_t p_t+\nabla\cdot(p_t v_t)=0
$$

第一式是 Fokker–Planck 方程，第二式是反向时间 SDE，第三式是概率流 ODE 与连续性方程。
反向漂移与前向漂移相差 $g^2\nabla\log p_t$，而概率流速度只相差 $\tfrac12 g^2\nabla\log p_t$——
把两者混为一谈是扩散理论最常见的错误，本书用三个独立定理把它们分开。

## 写作纪律

1. 每个命题先列假设：可测性、可积性、Lipschitz、边界通量消失、平方可积、非负速率、紧支撑。
2. 交换积分与极限、求导与积分、期望与梯度时，必须引用 Dominated Convergence / Leibniz / Fubini 并验证条件。
3. 条件流匹配是**梯度**等价，不是目标值相等；给出正交投影分解
   $\mathbb E\|v-u\|^2=\mathbb E\|v-\bar u\|^2+\mathbb E\|u-\bar u\|^2$。
4. 反例节逐条拆掉一个假设，展示结论如何失效。
5. 代码节给出输入输出契约、张量形状、稳定性条件与断言。全部 206 个代码节的断言块已在本机逐块实跑通过；
   其中依赖 PyTorch 的完整实现块需要 PyTorch 环境（本机未安装），这类块的断言在写作时按接口契约给出，
   未在本机执行，运行环境与依赖在节内注明。

## 本地构建

```bash
python3 tools/gen.py --all --workers 4     # 生成（断点续跑）
python3 tools/normalize.py                 # 合并重复小结
python3 tools/verify_structure.py          # 结构校验
python3 tools/verify_code.py               # 代码断言校验
python3 tools/build_data.py                # 装配站点数据
python3 -m http.server 8911 --directory site
```

## 许可

正文 CC BY 4.0，代码 MIT。
