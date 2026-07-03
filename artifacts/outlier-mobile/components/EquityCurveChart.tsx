import { useGetEquityCurve } from "@workspace/api-client-react";
import React, { useMemo, useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";

import { useColors } from "@/hooks/useColors";

function fmtShort(n: number) {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(1)}k`;
  return `${sign}$${abs.toFixed(0)}`;
}

function buildPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return "";
  return points.reduce((acc, p, i) => acc + `${i === 0 ? "M" : "L"}${p.x},${p.y}`, "");
}

const HEIGHT = 160;
const PADDING_Y = 10;

export default function EquityCurveChart() {
  const colors = useColors();
  const { data: equity, isLoading } = useGetEquityCurve();
  const [width, setWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const { linePath, areaPath, minBalance, maxBalance } = useMemo(() => {
    if (!equity || equity.length < 2 || width === 0) {
      return { linePath: "", areaPath: "", minBalance: 0, maxBalance: 0 };
    }
    const balances = equity.map(p => p.balance);
    const min = Math.min(...balances);
    const max = Math.max(...balances);
    const range = max - min || 1;

    const points = equity.map((p, i) => ({
      x: (i / (equity.length - 1)) * width,
      y: HEIGHT - PADDING_Y - ((p.balance - min) / range) * (HEIGHT - PADDING_Y * 2),
    }));

    const line = buildPath(points);
    const area = `${line} L${points[points.length - 1].x},${HEIGHT} L0,${HEIGHT} Z`;
    return { linePath: line, areaPath: area, minBalance: min, maxBalance: max };
  }, [equity, width]);

  const first = equity?.[0]?.balance ?? 0;
  const last = equity?.[equity.length - 1]?.balance ?? 0;
  const growth = first > 0 ? ((last - first) / first) * 100 : 0;
  const positive = growth >= 0;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Curva de Capital</Text>
        {equity && equity.length > 1 && (
          <View
            style={[
              styles.badge,
              { backgroundColor: positive ? colors.profitBg : colors.lossBg },
            ]}
          >
            <Text style={[styles.badgeText, { color: positive ? colors.profit : colors.loss }]}>
              {positive ? "+" : ""}
              {growth.toFixed(1)}%
            </Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={[styles.skeleton, { backgroundColor: colors.muted }]} />
      ) : !equity || equity.length < 2 ? (
        <View style={styles.emptyBox}>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Sem dados suficientes. Registe operações para ver a evolução do capital.
          </Text>
        </View>
      ) : (
        <View onLayout={onLayout}>
          {width > 0 && (
            <Svg width={width} height={HEIGHT}>
              <Defs>
                <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.35} />
                  <Stop offset="100%" stopColor={colors.primary} stopOpacity={0} />
                </LinearGradient>
              </Defs>
              <Path d={areaPath} fill="url(#grad)" />
              <Path d={linePath} stroke={colors.primary} strokeWidth={2.5} fill="none" />
              {equity.length > 0 && width > 0 && (
                <Circle
                  cx={width}
                  cy={
                    HEIGHT -
                    PADDING_Y -
                    ((last - minBalance) / ((maxBalance - minBalance) || 1)) * (HEIGHT - PADDING_Y * 2)
                  }
                  r={4}
                  fill={colors.primary}
                />
              )}
            </Svg>
          )}
          <View style={styles.axisRow}>
            <Text style={[styles.axisLabel, { color: colors.mutedForeground }]}>{fmtShort(minBalance)}</Text>
            <Text style={[styles.axisLabel, { color: colors.mutedForeground }]}>{fmtShort(maxBalance)}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 14 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  title: { fontFamily: "Inter_700Bold", fontSize: 14 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontFamily: "Inter_700Bold", fontSize: 11 },
  skeleton: { height: HEIGHT, borderRadius: 10 },
  emptyBox: { height: HEIGHT, alignItems: "center", justifyContent: "center", paddingHorizontal: 12 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 12, textAlign: "center" },
  axisRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  axisLabel: { fontFamily: "Inter_500Medium", fontSize: 10 },
});
