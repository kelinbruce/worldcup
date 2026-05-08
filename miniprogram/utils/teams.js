// 2026 世界杯 48 支参赛球队数据 (12组 × 4队)
const TEAMS = [
  // A组: USA BRA GER MAR
  { code: 'USA', name: '美国', nameEn: 'United States', flag: '🇺🇸', confederation: 'CONCACAF', group: 'A' },
  { code: 'BRA', name: '巴西', nameEn: 'Brazil', flag: '🇧🇷', confederation: 'CONMEBOL', group: 'A' },
  { code: 'GER', name: '德国', nameEn: 'Germany', flag: '🇩🇪', confederation: 'UEFA', group: 'A' },
  { code: 'MAR', name: '摩洛哥', nameEn: 'Morocco', flag: '🇲🇦', confederation: 'CAF', group: 'A' },
  // B组: MEX ARG FRA SEN
  { code: 'MEX', name: '墨西哥', nameEn: 'Mexico', flag: '🇲🇽', confederation: 'CONCACAF', group: 'B' },
  { code: 'ARG', name: '阿根廷', nameEn: 'Argentina', flag: '🇦🇷', confederation: 'CONMEBOL', group: 'B' },
  { code: 'FRA', name: '法国', nameEn: 'France', flag: '🇫🇷', confederation: 'UEFA', group: 'B' },
  { code: 'SEN', name: '塞内加尔', nameEn: 'Senegal', flag: '🇸🇳', confederation: 'CAF', group: 'B' },
  // C组: CAN URU ENG NGA
  { code: 'CAN', name: '加拿大', nameEn: 'Canada', flag: '🇨🇦', confederation: 'CONCACAF', group: 'C' },
  { code: 'URU', name: '乌拉圭', nameEn: 'Uruguay', flag: '🇺🇾', confederation: 'CONMEBOL', group: 'C' },
  { code: 'ENG', name: '英格兰', nameEn: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', confederation: 'UEFA', group: 'C' },
  { code: 'NGA', name: '尼日利亚', nameEn: 'Nigeria', flag: '🇳🇬', confederation: 'CAF', group: 'C' },
  // D组: JAM COL ESP CMR
  { code: 'JAM', name: '牙买加', nameEn: 'Jamaica', flag: '🇯🇲', confederation: 'CONCACAF', group: 'D' },
  { code: 'COL', name: '哥伦比亚', nameEn: 'Colombia', flag: '🇨🇴', confederation: 'CONMEBOL', group: 'D' },
  { code: 'ESP', name: '西班牙', nameEn: 'Spain', flag: '🇪🇸', confederation: 'UEFA', group: 'D' },
  { code: 'CMR', name: '喀麦隆', nameEn: 'Cameroon', flag: '🇨🇲', confederation: 'CAF', group: 'D' },
  // E组: HON ECU POR GHA
  { code: 'HON', name: '洪都拉斯', nameEn: 'Honduras', flag: '🇭🇳', confederation: 'CONCACAF', group: 'E' },
  { code: 'ECU', name: '厄瓜多尔', nameEn: 'Ecuador', flag: '🇪🇨', confederation: 'CONMEBOL', group: 'E' },
  { code: 'POR', name: '葡萄牙', nameEn: 'Portugal', flag: '🇵🇹', confederation: 'UEFA', group: 'E' },
  { code: 'GHA', name: '加纳', nameEn: 'Ghana', flag: '🇬🇭', confederation: 'CAF', group: 'E' },
  // F组: CRC PAR NED EGY
  { code: 'CRC', name: '哥斯达黎加', nameEn: 'Costa Rica', flag: '🇨🇷', confederation: 'CONCACAF', group: 'F' },
  { code: 'PAR', name: '巴拉圭', nameEn: 'Paraguay', flag: '🇵🇾', confederation: 'CONMEBOL', group: 'F' },
  { code: 'NED', name: '荷兰', nameEn: 'Netherlands', flag: '🇳🇱', confederation: 'UEFA', group: 'F' },
  { code: 'EGY', name: '埃及', nameEn: 'Egypt', flag: '🇪🇬', confederation: 'CAF', group: 'F' },
  // G组: BEL TUN JPN PAN
  { code: 'BEL', name: '比利时', nameEn: 'Belgium', flag: '🇧🇪', confederation: 'UEFA', group: 'G' },
  { code: 'TUN', name: '突尼斯', nameEn: 'Tunisia', flag: '🇹🇳', confederation: 'CAF', group: 'G' },
  { code: 'JPN', name: '日本', nameEn: 'Japan', flag: '🇯🇵', confederation: 'AFC', group: 'G' },
  { code: 'PAN', name: '巴拿马', nameEn: 'Panama', flag: '🇵🇦', confederation: 'CONCACAF', group: 'G' },
  // H组: CRO RSA KOR VEN
  { code: 'CRO', name: '克罗地亚', nameEn: 'Croatia', flag: '🇭🇷', confederation: 'UEFA', group: 'H' },
  { code: 'RSA', name: '南非', nameEn: 'South Africa', flag: '🇿🇦', confederation: 'CAF', group: 'H' },
  { code: 'KOR', name: '韩国', nameEn: 'South Korea', flag: '🇰🇷', confederation: 'AFC', group: 'H' },
  { code: 'VEN', name: '委内瑞拉', nameEn: 'Venezuela', flag: '🇻🇪', confederation: 'CONMEBOL', group: 'H' },
  // I组: SUI CIV AUS NZL
  { code: 'SUI', name: '瑞士', nameEn: 'Switzerland', flag: '🇨🇭', confederation: 'UEFA', group: 'I' },
  { code: 'CIV', name: '科特迪瓦', nameEn: 'Ivory Coast', flag: '🇨🇮', confederation: 'CAF', group: 'I' },
  { code: 'AUS', name: '澳大利亚', nameEn: 'Australia', flag: '🇦🇺', confederation: 'AFC', group: 'I' },
  { code: 'NZL', name: '新西兰', nameEn: 'New Zealand', flag: '🇳🇿', confederation: 'OFC', group: 'I' },
  // J组: DEN KSA AUT IRN
  { code: 'DEN', name: '丹麦', nameEn: 'Denmark', flag: '🇩🇰', confederation: 'UEFA', group: 'J' },
  { code: 'KSA', name: '沙特阿拉伯', nameEn: 'Saudi Arabia', flag: '🇸🇦', confederation: 'AFC', group: 'J' },
  { code: 'AUT', name: '奥地利', nameEn: 'Austria', flag: '🇦🇹', confederation: 'UEFA', group: 'J' },
  { code: 'IRN', name: '伊朗', nameEn: 'Iran', flag: '🇮🇷', confederation: 'AFC', group: 'J' },
  // K组: POL IRQ SRB QAT
  { code: 'POL', name: '波兰', nameEn: 'Poland', flag: '🇵🇱', confederation: 'UEFA', group: 'K' },
  { code: 'IRQ', name: '伊拉克', nameEn: 'Iraq', flag: '🇮🇶', confederation: 'AFC', group: 'K' },
  { code: 'SRB', name: '塞尔维亚', nameEn: 'Serbia', flag: '🇷🇸', confederation: 'UEFA', group: 'K' },
  { code: 'QAT', name: '卡塔尔', nameEn: 'Qatar', flag: '🇶🇦', confederation: 'AFC', group: 'K' },
  // L组: TUR SCO HUN JOR
  { code: 'TUR', name: '土耳其', nameEn: 'Turkey', flag: '🇹🇷', confederation: 'UEFA', group: 'L' },
  { code: 'SCO', name: '苏格兰', nameEn: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', confederation: 'UEFA', group: 'L' },
  { code: 'HUN', name: '匈牙利', nameEn: 'Hungary', flag: '🇭🇺', confederation: 'UEFA', group: 'L' },
  { code: 'JOR', name: '约旦', nameEn: 'Jordan', flag: '🇯🇴', confederation: 'AFC', group: 'L' },
]

const TEAM_MAP = {}
TEAMS.forEach(t => { TEAM_MAP[t.code] = t })

function getTeam(code) {
  return TEAM_MAP[code] || { code, name: code, flag: '🏳️', nameEn: code }
}

function getAllTeams() {
  return TEAMS
}

function getTeamsByConfederation(conf) {
  return TEAMS.filter(t => t.confederation === conf)
}

module.exports = { TEAMS, getTeam, getAllTeams, getTeamsByConfederation }
