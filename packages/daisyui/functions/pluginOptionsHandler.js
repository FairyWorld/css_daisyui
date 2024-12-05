export const pluginOptionsHandler = (() => {
  let firstRun = true
  return (options, addBase, themesObject, packageVersion) => {
    const {
      logs = true,
      root = ":root",
      themes = ["light --default", "dark --prefersdark"],
      include,
      exclude,
      prefix = "",
    } = options || {}

    if (logs !== false && firstRun) {
      console.log(
        `${atob("Lyoh")} ${decodeURIComponent("%F0%9F%8C%BC")} ${atob("ZGFpc3lVSQ==")} ${packageVersion} ${atob("Ki8=")}`,
      )
      firstRun = false
    }

    const applyTheme = (themeName, flags) => {
      const theme = themesObject[themeName]
      if (theme) {
        let selector = `${root}:has(input.theme-controller[value=${themeName}]:checked),[data-theme=${themeName}]`
        if (flags.includes("--default")) {
          selector = `:where(${root}),${selector}`
        }
        addBase({ [selector]: theme })

        if (flags.includes("--prefersdark")) {
          addBase({ "@media (prefers-color-scheme: dark)": { [root]: theme } })
        }
      }
    }

    if (themes === "all") {
      Object.keys(themesObject).forEach((themeName) => {
        const flags = []
        if (themeName === "light") {
          flags.push("--default")
        } else if (themeName === "dark") {
          flags.push("--prefersdark")
        }
        applyTheme(themeName, flags)
      })
    } else if (themes) {
      const themeArray = Array.isArray(themes) ? themes : [themes]
      themeArray.forEach((themeOption) => {
        const [themeName, ...flags] = themeOption.split(" ")
        applyTheme(themeName, flags)
      })
    }

    return { include, exclude, prefix }
  }
})()
