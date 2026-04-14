/**
 * FlightCard.tsx
 *
 * 简化版机票卡片，对齐 corp-bizComp-ai 里 FlightCard 的视觉结构：
 *   左区：航司 Logo + 航班号
 *   中区：出发时间 → 到达时间、时长、机场
 *   右区：价格 + 标签
 */

import type { FlightItem } from '../../reducer/chatReducer';
import styles from './FlightCard.module.css';

// 航司颜色映射（对应真实项目里的 airlineCode 处理）
const AIRLINE_COLORS: Record<string, string> = {
  CA: '#e60012', // 国航
  MU: '#1a1aff', // 东航
  CZ: '#0033a0', // 南航
};

interface FlightCardProps {
  flight: FlightItem;
  isRecommend?: boolean;
}

export default function FlightCard({ flight, isRecommend }: FlightCardProps) {
  const bgColor = AIRLINE_COLORS[flight.airlineCode] || '#666';

  return (
    <div className={`${styles.card} ${isRecommend ? styles.recommend : ''}`}>
      {isRecommend && <div className={styles.corner}>为您推荐</div>}

      {/* 左区：航司 */}
      <div className={styles.left}>
        <div className={styles.airlineLogo} style={{ background: bgColor }}>
          {flight.airlineCode}
        </div>
        <div className={styles.flightNo}>{flight.flightNo}</div>
        <div className={styles.cabin}>{flight.cabin}</div>
      </div>

      {/* 中区：时间 + 机场 */}
      <div className={styles.mid}>
        <div className={styles.timeRow}>
          <span className={styles.time}>{flight.departTime}</span>
          <div className={styles.arrow}>
            <div className={styles.line} />
            <span className={styles.duration}>{flight.duration}</span>
            <div className={styles.arrowHead}>→</div>
          </div>
          <span className={styles.time}>{flight.arriveTime}</span>
        </div>
        <div className={styles.airportRow}>
          <span>{flight.departAirport}</span>
          <span>{flight.arriveAirport}</span>
        </div>
      </div>

      {/* 右区：价格 + 标签 */}
      <div className={styles.right}>
        <div className={styles.price}>
          <span className={styles.currency}>¥</span>
          <span className={styles.amount}>{flight.price}</span>
        </div>
        {flight.ticketLeft && (
          <div className={styles.ticketLeft}>{flight.ticketLeft}</div>
        )}
        {flight.tags.map((tag, i) => (
          <div key={i} className={styles.tag} style={{ color: tag.color, borderColor: tag.color }}>
            {tag.text}
          </div>
        ))}
      </div>
    </div>
  );
}
