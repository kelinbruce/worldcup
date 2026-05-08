Component({
  properties: {
    match: {
      type: Object,
      value: null,
    },
  },

  methods: {
    onTap() {
      this.triggerEvent('tap', { matchId: this.properties.match.matchId })
    },
  },
})
