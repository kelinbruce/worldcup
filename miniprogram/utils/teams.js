// 2026 世界杯 48 支参赛球队数据
const TEAMS = [
  // UEFA (16队)
  { code: 'GER', name: '德国', nameEn: 'Germany', flag: '🇩🇪', confederation: 'UEFA', group: 'A' },
  { code: 'FRA', name: '法国', nameEn: 'France', flag: '🇫🇷', confederation: 'UEFA', group: 'B' },
  { code: 'ESP', name: '西班牙', nameEn: 'Spain', flag: '🇪🇸', confederation: 'UEFA', group: 'C' },
  { code: 'ENG', name: '英格兰', nameEn: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', confederation: 'UEFA', group: 'D' },
  { code: 'POR', name: '葡萄牙', nameEn: 'Portugal', flag: '🇵🇹', confederation: 'UEFA', group: 'E' },
  { code: 'NED', name: '荷兰', nameEn: 'Netherlands', flag: '🇳🇱', confederation: 'UEFA', group: 'F' },
  { code: 'BEL', name: '比利时', nameEn: 'Belgium', flag: '🇧🇪', confederation: 'UEFA', group: 'G' },
  { code: 'CRO', name: '克罗地亚', nameEn: 'Croatia', flag: '🇭🇷', confederation: 'UEFA', group: 'H' },
  { code: 'SUI', name: '瑞士', nameEn: 'Switzerland', flag: '🇨🇭', confederation: 'UEFA', group: 'A' },
  { code: 'DEN', name: '丹麦', nameEn: 'Denmark', flag: '🇩🇰', confederation: 'UEFA', group: 'B' },
  { code: 'AUT', name: '奥地利', nameEn: 'Austria', flag: '🇦🇹', confederation: 'UEFA', group: 'C' },
  { code: 'POL', name: '波兰', nameEn: 'Poland', flag: '🇵🇱', confederation: 'UEFA', group: 'D' },
  { code: 'SRB', name: '塞尔维亚', nameEn: 'Serbia', flag: '🇷🇸', confederation: 'UEFA', group: 'E' },
  { code: 'TUR', name: '土耳其', nameEn: 'Turkey', flag: '🇹🇷', confederation: 'UEFA', group: 'F' },
  { code: 'SCO', name: '苏格兰', nameEn: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', confederation: 'UEFA', group: 'G' },
  { code: 'HUN', name: '匈牙利', nameEn: 'Hungary', flag: '🇭🇺', confederation: 'UEFA', group: 'H' },
  // CONMEBOL (6队)
  { code: 'BRA', name: '巴西', nameEn: 'Brazil', flag: '🇧🇷', confederation: 'CONMEBOL', group: 'A' },
  { code: 'ARG', name: '阿根廷', nameEn: 'Argentina', flag: '🇦🇷', confederation: 'CONMEBOL', group: 'B' },
  { code: 'URU', name: '乌拉圭', nameEn: 'Uruguay', flag: '🇺🇾', confederation: 'CONMEBOL', group: 'C' },
  { code: 'COL', name: '哥伦比亚', nameEn: 'Colombia', flag: '🇨🇴', confederation: 'CONMEBOL', group: 'D' },
  { code: 'ECU', name: '厄瓜多尔', nameEn: 'Ecuador', flag: '🇪🇨', confederation: 'CONMEBOL', group: 'E' },
  { code: 'PAR', name: '巴拉圭', nameEn: 'Paraguay', flag: '🇵🇾', confederation: 'CONMEBOL', group: 'F' },
  // CONCACAF (6队)
  { code: 'USA', name: '美国', nameEn: 'United States', flag: '🇺🇸', confederation: 'CONCACAF', group: 'A' },
  { code: 'MEX', name: '墨西哥', nameEn: 'Mexico', flag: '🇲🇽', confederation: 'CONCACAF', group: 'B' },
  { code: 'CAN', name: '加拿大', nameEn: 'Canada', flag: '🇨🇦', confederation: 'CONCACAF', group: 'C' },
  { code: 'JAM', name: '牙买加', nameEn: 'Jamaica', flag: '🇯🇲', confederation: 'CONCACAF', group: 'D' },
  { code: 'HON', name: '洪都拉斯', nameEn: 'Honduras', flag: '🇭🇳', confederation: 'CONCACAF', group: 'E' },
  { code: 'CRC', name: '哥斯达黎加', nameEn: 'Costa Rica', flag: '🇨🇷', confederation: 'CONCACAF', group: 'F' },
  // CAF (9队)
  { code: 'MAR', name: '摩洛哥', nameEn: 'Morocco', flag: '🇲🇦', confederation: 'CAF', group: 'G' },
  { code: 'SEN', name: '塞内加尔', nameEn: 'Senegal', flag: '🇸🇳', confederation: 'CAF', group: 'H' },
  { code: 'NGA', name: '尼日利亚', nameEn: 'Nigeria', flag: '🇳🇬', confederation: 'CAF', group: 'A' },
  { code: 'CMR', name: '喀麦隆', nameEn: 'Cameroon', flag: '🇨🇲', confederation: 'CAF', group: 'B' },
  { code: 'GHA', name: '加纳', nameEn: 'Ghana', flag: '🇬🇭', confederation: 'CAF', group: 'C' },
  { code: 'EGY', name: '埃及', nameEn: 'Egypt', flag: '🇪🇬', confederation: 'CAF', group: 'D' },
  { code: 'TUN', name: '突尼斯', nameEn: 'Tunisia', flag: '🇹🇳', confederation: 'CAF', group: 'E' },
  { code: 'RSA', name: '南非', nameEn: 'South Africa', flag: '🇿🇦', confederation: 'CAF', group: 'F' },
  { code: 'CIV', name: '科特迪瓦', nameEn: 'Ivory Coast', flag: '🇨🇮', confederation: 'CAF', group: 'G' },
  // AFC (8队)
  { code: 'JPN', name: '日本', nameEn: 'Japan', flag: '🇯🇵', confederation: 'AFC', group: 'H' },
  { code: 'KOR', name: '韩国', nameEn: 'South Korea', flag: '🇰🇷', confederation: 'AFC', group: 'A' },
  { code: 'AUS', name: '澳大利亚', nameEn: 'Australia', flag: '🇦🇺', confederation: 'AFC', group: 'B' },
  { code: 'KSA', name: '沙特阿拉伯', nameEn: 'Saudi Arabia', flag: '🇸🇦', confederation: 'AFC', group: 'C' },
  { code: 'IRN', name: '伊朗', nameEn: 'Iran', flag: '🇮🇷', confederation: 'AFC', group: 'D' },
  { code: 'QAT', name: '卡塔尔', nameEn: 'Qatar', flag: '🇶🇦', confederation: 'AFC', group: 'E' },
  { code: 'IRQ', name: '伊拉克', nameEn: 'Iraq', flag: '🇮🇶', confederation: 'AFC', group: 'F' },
  { code: 'JOR', name: '约旦', nameEn: 'Jordan', flag: '🇯🇴', confederation: 'AFC', group: 'G' },
  // OFC (1队)
  { code: 'NZL', name: '新西兰', nameEn: 'New Zealand', flag: '🇳🇿', confederation: 'OFC', group: 'H' },
  // 附加赛席位 (2队)
  { code: 'PAN', name: '巴拿马', nameEn: 'Panama', flag: '🇵🇦', confederation: 'CONCACAF', group: 'H' },
  { code: 'VEN', name: '委内瑞拉', nameEn: 'Venezuela', flag: '🇻🇪', confederation: 'CONMEBOL', group: 'G' },
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
