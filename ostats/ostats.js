;(function () {
  function createStatElement(container, title, heading) {
    const statEl = document.createElement('div')
    statEl.classList.add('stats-element')
    container.appendChild(statEl)

    const statTitle = document.createElement('p')
    statTitle.classList.add('title')
    statTitle.innerText = title
    statEl.appendChild(statTitle)

    const statHeading = document.createElement('p')
    statHeading.classList.add('heading')
    statHeading.innerText = heading
    statEl.appendChild(statHeading)
  }

  function createImageStatElement(container, scene, title, heading) {
    const statEl = document.createElement('div')
    statEl.classList.add('stats-element')
    statEl.style.maxWidth = '250px'
    statEl.style.textAlign = 'center'
    container.appendChild(statEl)

    const link = document.createElement('a')
    link.href = `/scenes/${scene.id}`
    link.style.textDecoration = 'none'
    link.style.display = 'block'
    statEl.appendChild(link)

    const imgContainer = document.createElement('div')
    imgContainer.style.width = '100%'
    imgContainer.style.height = '140px'
    imgContainer.style.backgroundColor = '#000'
    imgContainer.style.borderRadius = '4px'
    imgContainer.style.marginBottom = '0.5rem'
    imgContainer.style.display = 'flex'
    imgContainer.style.alignItems = 'center'
    imgContainer.style.justifyContent = 'center'
    imgContainer.style.overflow = 'hidden'
    link.appendChild(imgContainer)

    const img = document.createElement('img')
    img.src = scene.paths.screenshot
    img.style.maxWidth = '100%'
    img.style.maxHeight = '100%'
    img.style.objectFit = 'contain'
    img.style.display = 'block'
    imgContainer.appendChild(img)

    const statTitle = document.createElement('p')
    statTitle.classList.add('title')
    statTitle.innerText = title
    statTitle.style.margin = '0'
    statTitle.style.fontSize = '0.9rem'
    link.appendChild(statTitle)

    const statHeading = document.createElement('p')
    statHeading.classList.add('heading')
    statHeading.innerText = heading
    statHeading.style.margin = '0'
    statHeading.style.fontSize = '0.85rem'
    link.appendChild(statHeading)
  }

  function createGalleryImageStatElement(container, image, title, heading) {
    const statEl = document.createElement('div')
    statEl.classList.add('stats-element')
    statEl.style.maxWidth = '250px'
    statEl.style.textAlign = 'center'
    container.appendChild(statEl)

    const link = document.createElement('a')
    link.href = `/images/${image.id}`
    link.style.textDecoration = 'none'
    link.style.display = 'block'
    statEl.appendChild(link)

    const imgContainer = document.createElement('div')
    imgContainer.style.width = '100%'
    imgContainer.style.height = '140px'
    imgContainer.style.backgroundColor = '#000'
    imgContainer.style.borderRadius = '4px'
    imgContainer.style.marginBottom = '0.5rem'
    imgContainer.style.display = 'flex'
    imgContainer.style.alignItems = 'center'
    imgContainer.style.justifyContent = 'center'
    imgContainer.style.overflow = 'hidden'
    link.appendChild(imgContainer)

    const img = document.createElement('img')
    img.src = image.paths.image
    img.style.maxWidth = '100%'
    img.style.maxHeight = '100%'
    img.style.objectFit = 'contain'
    img.style.display = 'block'
    imgContainer.appendChild(img)

    const statTitle = document.createElement('p')
    statTitle.classList.add('title')
    statTitle.innerText = title
    statTitle.style.margin = '0'
    statTitle.style.fontSize = '0.9rem'
    link.appendChild(statTitle)

    const statHeading = document.createElement('p')
    statHeading.classList.add('heading')
    statHeading.innerText = heading
    statHeading.style.margin = '0'
    statHeading.style.fontSize = '0.85rem'
    link.appendChild(statHeading)
  }

  // fetch all scenes with o_history for orgasm stats
  async function getScenesWithOHistory() {
    const query = `query {
      findScenes(scene_filter: {}, filter: { per_page: -1 }) {
        scenes {
          id
          title
          o_counter
          o_history
          play_duration
          play_history
          paths {
            screenshot
          }
        }
      }
    }`
    return await csLib
      .callGQL({ query })
      .then((data) => data.findScenes?.scenes || [])
  }

  // fetch all images with o_counter
  async function getImagesWithOCounter() {
    const query = `query {
      findImages(image_filter: {}, filter: { per_page: -1 }) {
        images {
          id
          title
          o_counter
          paths {
            image
          }
        }
      }
    }`
    return await csLib
      .callGQL({ query })
      .then((data) => data.findImages?.images || [])
  }

  // orgasms today
  async function createOrgasmsToday(row) {
    const scenes = await getScenesWithOHistory()

    // Get today in local timezone
    const now = new Date()
    const today = now.toLocaleDateString('en-CA') // YYYY-MM-DD format

    let todayCount = 0

    scenes.forEach((scene) => {
      if (scene.o_history && scene.o_history.length > 0) {
        scene.o_history.forEach((timestamp) => {
          // Convert UTC timestamp to local timezone
          const date = new Date(timestamp)
          const day = date.toLocaleDateString('en-CA') // YYYY-MM-DD format

          if (day === today) {
            todayCount++
          }
        })
      }
    })

    createStatElement(row, `${todayCount} 💦`, "O's Today")
  }

  // day with most orgasms
  async function createBestOrgasmDay(row) {
    const scenes = await getScenesWithOHistory()
    const dayTotals = {}

    scenes.forEach((scene) => {
      if (scene.o_history && scene.o_history.length > 0) {
        scene.o_history.forEach((timestamp) => {
          // Convert UTC timestamp to local timezone
          const date = new Date(timestamp)
          const day = date.toLocaleDateString('en-CA') // YYYY-MM-DD format
          dayTotals[day] = (dayTotals[day] || 0) + 1
        })
      }
    })

    const maxCount = Math.max(0, ...Object.values(dayTotals))
    const bestDay = Object.keys(dayTotals).find(
      (day) => dayTotals[day] === maxCount
    )

    let heading = maxCount.toString()
    let title = 'Record Day'
    if (bestDay) {
      const [year, month, day] = bestDay.split('-')
      const formatted = `${month}/${day}/${year.slice(2)}`
      heading = `Record Day: ${formatted}`
      title = `${maxCount} ☔`
    }
    createStatElement(row, title, heading)
  }

  // consecutive days streak
  async function createOrgasmStreak(row) {
    const scenes = await getScenesWithOHistory()
    const daySet = new Set()

    scenes.forEach((scene) => {
      if (scene.o_history && scene.o_history.length > 0) {
        scene.o_history.forEach((timestamp) => {
          // Convert UTC timestamp to local timezone
          const date = new Date(timestamp)
          const day = date.toLocaleDateString('en-CA') // YYYY-MM-DD format
          daySet.add(day)
        })
      }
    })

    const sortedDays = Array.from(daySet).sort().reverse()
    let streak = 0
    // Get today in local timezone
    const now = new Date()
    const today = new Date(now.toLocaleDateString('en-CA'))

    for (let i = 0; i < sortedDays.length; i++) {
      const currentDate = new Date(sortedDays[i])
      const expectedDate = new Date(today)
      expectedDate.setDate(today.getDate() - i)

      if (currentDate.getTime() === expectedDate.getTime()) {
        streak++
      } else {
        break
      }
    }

    const displayStreak = streak > 1 ? `${streak} 🔥` : streak
    createStatElement(row, displayStreak, 'O Streak (days)')
  }

  // longest watched day
  async function createLongestWatchedDay(row) {
    const scenes = await getScenesWithOHistory()
    const dayTotals = {}

    // Calculate total watch time per day
    scenes.forEach((scene) => {
      if (scene.play_history && scene.play_history.length > 0) {
        scene.play_history.forEach((timestamp) => {
          // Convert UTC timestamp to local timezone
          const date = new Date(timestamp)
          const day = date.toLocaleDateString('en-CA') // YYYY-MM-DD format

          if (scene.play_duration && scene.play_duration > 0) {
            const durationPerPlay =
              scene.play_duration / scene.play_history.length
            dayTotals[day] = (dayTotals[day] || 0) + durationPerPlay
          }
        })
      }
    })

    let maxDuration = 0
    let maxDay = null

    Object.keys(dayTotals).forEach((day) => {
      if (dayTotals[day] > maxDuration) {
        maxDuration = dayTotals[day]
        maxDay = day
      }
    })

    let title = '0m'
    let heading = 'Record Session'
    if (maxDay) {
      const hours = Math.floor(maxDuration / 3600)
      const minutes = Math.floor((maxDuration % 3600) / 60)
      const [year, month, day] = maxDay.split('-')
      const formatted = `${month}/${day}/${year.slice(2)}`

      if (hours > 0) {
        title = `${hours}h ${minutes}m ⌛`
      } else if (minutes > 0) {
        title = `${minutes}m ⌛`
      } else {
        title = `${Math.floor(maxDuration)}s ⌛`
      }
      heading = `Record Session: ${formatted}`
    }

    createStatElement(row, title, heading)
  }

  // scene with most orgasms
  async function createMostOScene(row) {
    const scenes = await getScenesWithOHistory()
    let maxScene = null
    let maxCount = 0

    scenes.forEach((scene) => {
      const count = scene.o_counter || 0
      if (count > maxCount) {
        maxCount = count
        maxScene = scene
      }
    })

    if (maxScene) {
      createImageStatElement(row, maxScene, maxCount, "Scene with Most O's")
    } else {
      createStatElement(row, 'N/A', "Scene with Most O's")
    }
  }

  // longest watched scene
  async function createLongestWatchedScene(row) {
    const scenes = await getScenesWithOHistory()
    let maxScene = null
    let maxDuration = 0

    scenes.forEach((scene) => {
      const duration = scene.play_duration || 0
      if (duration > maxDuration) {
        maxDuration = duration
        maxScene = scene
      }
    })

    if (maxScene) {
      const hours = Math.floor(maxDuration / 3600)
      const minutes = Math.floor((maxDuration % 3600) / 60)
      const seconds = Math.floor(maxDuration % 60)
      let timeStr = ''
      if (hours > 0) {
        timeStr = `${hours}h ${minutes}m`
      } else if (minutes > 0) {
        timeStr = `${minutes}m ${seconds}s`
      } else {
        timeStr = `${seconds}s`
      }
      createImageStatElement(row, maxScene, timeStr, 'Longest Play Duration')
    } else {
      createStatElement(row, 'N/A', 'Longest Play Duration')
    }
  }

  // image with most orgasms
  async function createMostOImage(row) {
    const images = await getImagesWithOCounter()
    let maxImage = null
    let maxCount = 0

    images.forEach((image) => {
      const count = image.o_counter || 0
      if (count > maxCount) {
        maxCount = count
        maxImage = image
      }
    })

    if (maxImage && maxCount > 0) {
      createGalleryImageStatElement(
        row,
        maxImage,
        maxCount,
        "Image with Most O's"
      )
    }
  }

  // most recent O scene
  async function createMostRecentOScene(row) {
    const scenes = await getScenesWithOHistory()
    let recentScene = null
    let recentTimestamp = null

    scenes.forEach((scene) => {
      if (scene.o_history && scene.o_history.length > 0) {
        const mostRecent = scene.o_history.sort().reverse()[0]
        if (!recentTimestamp || mostRecent > recentTimestamp) {
          recentTimestamp = mostRecent
          recentScene = scene
        }
      }
    })

    if (recentScene) {
      const date = new Date(recentTimestamp)
      const timeAgo = formatTimeAgo(date)
      createImageStatElement(row, recentScene, timeAgo, 'Most Recent O')
    }
  }

  // oldest O scene
  async function createOldestOScene(row) {
    const scenes = await getScenesWithOHistory()
    let oldestScene = null
    let oldestTimestamp = null

    scenes.forEach((scene) => {
      if (scene.o_history && scene.o_history.length > 0) {
        const oldest = scene.o_history.sort()[0]
        if (!oldestTimestamp || oldest < oldestTimestamp) {
          oldestTimestamp = oldest
          oldestScene = scene
        }
      }
    })

    if (oldestScene) {
      const date = new Date(oldestTimestamp)
      const timeAgo = formatTimeAgo(date)
      createImageStatElement(row, oldestScene, timeAgo, 'Oldest O')
    }
  }

  // helper to format time ago
  function formatTimeAgo(date) {
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    const diffMonths = Math.floor(diffDays / 30)
    const diffYears = Math.floor(diffDays / 365)

    if (diffMins < 60) {
      return `${diffMins}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else if (diffDays < 30) {
      return `${diffDays}d ago`
    } else if (diffMonths < 12) {
      return `${diffMonths}mo ago`
    } else {
      return `${diffYears}y ago`
    }
  }

  // weekly bar chart
  async function createWeeklyBarChart(row) {
    const scenes = await getScenesWithOHistory()

    // Create chart container
    const chartContainer = document.createElement('div')
    chartContainer.style.width = '100%'
    chartContainer.style.maxWidth = '800px'
    chartContainer.style.margin = '0 auto'
    chartContainer.style.padding = '1rem'
    row.appendChild(chartContainer)

    // Create header with title and buttons
    const headerContainer = document.createElement('div')
    headerContainer.style.display = 'flex'
    headerContainer.style.justifyContent = 'space-between'
    headerContainer.style.alignItems = 'center'
    headerContainer.style.marginBottom = '1rem'
    chartContainer.appendChild(headerContainer)

    const chartTitle = document.createElement('h4')
    chartTitle.innerText = `O'S`
    chartTitle.style.textAlign = 'center'
    chartTitle.style.fontSize = '1.2rem'
    chartTitle.style.margin = '0'
    headerContainer.appendChild(chartTitle)

    // Create button container
    const buttonContainer = document.createElement('div')
    buttonContainer.style.display = 'flex'
    buttonContainer.style.gap = '0.5rem'
    headerContainer.appendChild(buttonContainer)

    // Create view buttons
    const weekBtn = document.createElement('button')
    weekBtn.innerText = 'This Week'
    weekBtn.style.padding = '0.25rem 0.75rem'
    weekBtn.style.cursor = 'pointer'
    weekBtn.style.border = '1px solid #007bff'
    weekBtn.style.backgroundColor = '#007bff'
    weekBtn.style.color = '#fff'
    weekBtn.style.borderRadius = '4px'
    buttonContainer.appendChild(weekBtn)

    const monthBtn = document.createElement('button')
    monthBtn.innerText = 'This Month'
    monthBtn.style.padding = '0.25rem 0.75rem'
    monthBtn.style.cursor = 'pointer'
    monthBtn.style.border = '1px solid #555'
    monthBtn.style.backgroundColor = 'transparent'
    monthBtn.style.color = '#fff'
    monthBtn.style.borderRadius = '4px'
    buttonContainer.appendChild(monthBtn)

    const yearBtn = document.createElement('button')
    yearBtn.innerText = 'This Year'
    yearBtn.style.padding = '0.25rem 0.75rem'
    yearBtn.style.cursor = 'pointer'
    yearBtn.style.border = '1px solid #555'
    yearBtn.style.backgroundColor = 'transparent'
    yearBtn.style.color = '#fff'
    yearBtn.style.borderRadius = '4px'
    buttonContainer.appendChild(yearBtn)

    // Create bars container
    const barsContainer = document.createElement('div')
    barsContainer.style.display = 'flex'
    barsContainer.style.alignItems = 'flex-end'
    barsContainer.style.justifyContent = 'space-around'
    barsContainer.style.height = '300px'
    barsContainer.style.gap = '4px'
    chartContainer.appendChild(barsContainer)

    // Function to render chart
    function renderChart(view) {
      // Update button styles
      weekBtn.style.backgroundColor =
        view === 'week' ? '#007bff' : 'transparent'
      weekBtn.style.border =
        view === 'week' ? '1px solid #007bff' : '1px solid #555'
      monthBtn.style.backgroundColor =
        view === 'month' ? '#007bff' : 'transparent'
      monthBtn.style.border =
        view === 'month' ? '1px solid #007bff' : '1px solid #555'
      yearBtn.style.backgroundColor =
        view === 'year' ? '#007bff' : 'transparent'
      yearBtn.style.border =
        view === 'year' ? '1px solid #007bff' : '1px solid #555'

      // Get O counts for each day
      const dayTotals = {}
      scenes.forEach((scene) => {
        if (scene.o_history && scene.o_history.length > 0) {
          scene.o_history.forEach((timestamp) => {
            const date = new Date(timestamp)
            const day = date.toLocaleDateString('en-CA')
            dayTotals[day] = (dayTotals[day] || 0) + 1
          })
        }
      })

      const now = new Date()
      let data = []

      if (view === 'week') {
        // Get Monday of current week
        const dayOfWeek = now.getDay()
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Adjust to Monday
        const monday = new Date(now)
        monday.setDate(now.getDate() + diff)
        monday.setHours(0, 0, 0, 0)

        for (let i = 0; i < 7; i++) {
          const date = new Date(monday)
          date.setDate(monday.getDate() + i)
          const dayStr = date.toLocaleDateString('en-CA')
          const weekday = date.toLocaleDateString('en-US', { weekday: 'short' })
          const dayNum = date.getDate()
          data.push({
            date: dayStr,
            count: dayTotals[dayStr] || 0,
            label: `${weekday} ${dayNum}`,
          })
        }
      } else if (view === 'month') {
        // Current month - from day 1 to last day
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        const daysInMonth = lastDay.getDate()

        for (let i = 1; i <= daysInMonth; i++) {
          const date = new Date(now.getFullYear(), now.getMonth(), i)
          const dayStr = date.toLocaleDateString('en-CA')
          data.push({
            date: dayStr,
            count: dayTotals[dayStr] || 0,
            label: i.toString(),
          })
        }
      } else if (view === 'year') {
        // Get month totals for current year
        const monthTotals = {}
        Object.keys(dayTotals).forEach((dayStr) => {
          const date = new Date(dayStr)
          if (date.getFullYear() === now.getFullYear()) {
            const month = date.getMonth()
            monthTotals[month] = (monthTotals[month] || 0) + dayTotals[dayStr]
          }
        })

        const monthNames = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ]
        for (let i = 0; i < 12; i++) {
          data.push({
            date: `${now.getFullYear()}-${i}`,
            count: monthTotals[i] || 0,
            label: monthNames[i],
          })
        }
      }

      const nonZeroCounts = data.filter((d) => d.count > 0).map((d) => d.count)
      const maxCount = nonZeroCounts.length > 0 ? Math.max(...nonZeroCounts) : 1

      // Clear and render bars
      barsContainer.innerHTML = ''
      data.forEach((item) => {
        const barWrapper = document.createElement('div')
        barWrapper.style.flex = '1'
        barWrapper.style.display = 'flex'
        barWrapper.style.flexDirection = 'column'
        barWrapper.style.alignItems = 'center'
        barWrapper.style.height = '100%'
        barWrapper.style.justifyContent = 'flex-end'
        barsContainer.appendChild(barWrapper)

        const barContainer = document.createElement('div')
        barContainer.style.width = '100%'
        barContainer.style.display = 'flex'
        barContainer.style.flexDirection = 'column'
        barContainer.style.alignItems = 'center'
        barContainer.style.justifyContent = 'flex-end'
        barContainer.style.flex = '1'
        barWrapper.appendChild(barContainer)

        const bar = document.createElement('div')
        const height = item.count > 0 ? (item.count / maxCount) * 100 : 0
        bar.style.width = '100%'
        bar.style.height = `${height}%`
        bar.style.backgroundColor = '#007bff'
        bar.style.borderRadius = '4px 4px 0 0'
        bar.style.minHeight = item.count > 0 ? '4px' : '0'
        bar.style.position = 'relative'
        barContainer.appendChild(bar)

        const countLabel = document.createElement('div')
        countLabel.innerText = item.count
        countLabel.style.fontSize = '0.9rem'
        countLabel.style.fontWeight = 'bold'
        countLabel.style.marginBottom = '4px'
        countLabel.style.color = '#fff'
        countLabel.style.visibility = item.count === 0 ? 'hidden' : 'visible'
        barContainer.insertBefore(countLabel, bar)

        const dayLabel = document.createElement('div')
        dayLabel.innerText = item.label
        dayLabel.style.fontSize = '0.85rem'
        dayLabel.style.marginTop = '8px'
        dayLabel.style.textAlign = 'center'
        barWrapper.appendChild(dayLabel)
      })
    }

    // Add button click handlers
    weekBtn.addEventListener('click', () => renderChart('week'))
    monthBtn.addEventListener('click', () => renderChart('month'))
    yearBtn.addEventListener('click', () => renderChart('year'))

    // Initial render
    renderChart('week')
  }

  // weekly watch time bar chart
  async function createWeeklyWatchTimeChart(row) {
    const scenes = await getScenesWithOHistory()

    // Create chart container
    const chartContainer = document.createElement('div')
    chartContainer.style.width = '100%'
    chartContainer.style.maxWidth = '800px'
    chartContainer.style.margin = '0 auto'
    chartContainer.style.padding = '1rem'
    row.appendChild(chartContainer)

    // Create header with title and buttons
    const headerContainer = document.createElement('div')
    headerContainer.style.display = 'flex'
    headerContainer.style.justifyContent = 'space-between'
    headerContainer.style.alignItems = 'center'
    headerContainer.style.marginBottom = '1rem'
    chartContainer.appendChild(headerContainer)

    const chartTitle = document.createElement('h4')
    chartTitle.innerText = `WATCH TIME`
    chartTitle.style.textAlign = 'center'
    chartTitle.style.fontSize = '1.2rem'
    chartTitle.style.margin = '0'
    headerContainer.appendChild(chartTitle)

    // Create button container
    const buttonContainer = document.createElement('div')
    buttonContainer.style.display = 'flex'
    buttonContainer.style.gap = '0.5rem'
    headerContainer.appendChild(buttonContainer)

    // Create view buttons
    const weekBtn = document.createElement('button')
    weekBtn.innerText = 'This Week'
    weekBtn.style.padding = '0.25rem 0.75rem'
    weekBtn.style.cursor = 'pointer'
    weekBtn.style.border = '1px solid #28a745'
    weekBtn.style.backgroundColor = '#28a745'
    weekBtn.style.color = '#fff'
    weekBtn.style.borderRadius = '4px'
    buttonContainer.appendChild(weekBtn)

    const monthBtn = document.createElement('button')
    monthBtn.innerText = 'This Month'
    monthBtn.style.padding = '0.25rem 0.75rem'
    monthBtn.style.cursor = 'pointer'
    monthBtn.style.border = '1px solid #555'
    monthBtn.style.backgroundColor = 'transparent'
    monthBtn.style.color = '#fff'
    monthBtn.style.borderRadius = '4px'
    buttonContainer.appendChild(monthBtn)

    const yearBtn = document.createElement('button')
    yearBtn.innerText = 'This Year'
    yearBtn.style.padding = '0.25rem 0.75rem'
    yearBtn.style.cursor = 'pointer'
    yearBtn.style.border = '1px solid #555'
    yearBtn.style.backgroundColor = 'transparent'
    yearBtn.style.color = '#fff'
    yearBtn.style.borderRadius = '4px'
    buttonContainer.appendChild(yearBtn)

    // Create bars container
    const barsContainer = document.createElement('div')
    barsContainer.style.display = 'flex'
    barsContainer.style.alignItems = 'flex-end'
    barsContainer.style.justifyContent = 'space-around'
    barsContainer.style.height = '300px'
    barsContainer.style.gap = '4px'
    chartContainer.appendChild(barsContainer)

    // Function to format duration
    function formatDuration(seconds) {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      if (hours > 0) {
        return `${hours}h ${minutes}m`
      } else if (minutes > 0) {
        return `${minutes}m`
      } else if (seconds > 0) {
        return `${Math.floor(seconds)}s`
      }
      return '0m'
    }

    // Function to render chart
    function renderChart(view) {
      // Update button styles
      weekBtn.style.backgroundColor =
        view === 'week' ? '#28a745' : 'transparent'
      weekBtn.style.border =
        view === 'week' ? '1px solid #28a745' : '1px solid #555'
      monthBtn.style.backgroundColor =
        view === 'month' ? '#28a745' : 'transparent'
      monthBtn.style.border =
        view === 'month' ? '1px solid #28a745' : '1px solid #555'
      yearBtn.style.backgroundColor =
        view === 'year' ? '#28a745' : 'transparent'
      yearBtn.style.border =
        view === 'year' ? '1px solid #28a745' : '1px solid #555'

      // Get watch time for each day
      const dayTotals = {}
      scenes.forEach((scene) => {
        if (scene.play_history && scene.play_history.length > 0) {
          scene.play_history.forEach((timestamp) => {
            const date = new Date(timestamp)
            const day = date.toLocaleDateString('en-CA')
            if (scene.play_duration && scene.play_duration > 0) {
              const durationPerPlay =
                scene.play_duration / scene.play_history.length
              dayTotals[day] = (dayTotals[day] || 0) + durationPerPlay
            }
          })
        }
      })

      const now = new Date()
      let data = []

      if (view === 'week') {
        // Get Monday of current week
        const dayOfWeek = now.getDay()
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
        const monday = new Date(now)
        monday.setDate(now.getDate() + diff)
        monday.setHours(0, 0, 0, 0)

        for (let i = 0; i < 7; i++) {
          const date = new Date(monday)
          date.setDate(monday.getDate() + i)
          const dayStr = date.toLocaleDateString('en-CA')
          const weekday = date.toLocaleDateString('en-US', { weekday: 'short' })
          const dayNum = date.getDate()
          data.push({
            date: dayStr,
            duration: dayTotals[dayStr] || 0,
            label: `${weekday} ${dayNum}`,
          })
        }
      } else if (view === 'month') {
        // Current month - from day 1 to last day
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        const daysInMonth = lastDay.getDate()

        for (let i = 1; i <= daysInMonth; i++) {
          const date = new Date(now.getFullYear(), now.getMonth(), i)
          const dayStr = date.toLocaleDateString('en-CA')
          data.push({
            date: dayStr,
            duration: dayTotals[dayStr] || 0,
            label: i.toString(),
          })
        }
      } else if (view === 'year') {
        // Get month totals for current year
        const monthTotals = {}
        Object.keys(dayTotals).forEach((dayStr) => {
          const date = new Date(dayStr)
          if (date.getFullYear() === now.getFullYear()) {
            const month = date.getMonth()
            monthTotals[month] = (monthTotals[month] || 0) + dayTotals[dayStr]
          }
        })

        const monthNames = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ]
        for (let i = 0; i < 12; i++) {
          data.push({
            date: `${now.getFullYear()}-${i}`,
            duration: monthTotals[i] || 0,
            label: monthNames[i],
          })
        }
      }

      const nonZeroDurations = data
        .filter((d) => d.duration > 0)
        .map((d) => d.duration)
      const maxDuration =
        nonZeroDurations.length > 0 ? Math.max(...nonZeroDurations) : 1

      // Clear and render bars
      barsContainer.innerHTML = ''
      data.forEach((item) => {
        const barWrapper = document.createElement('div')
        barWrapper.style.flex = '1'
        barWrapper.style.display = 'flex'
        barWrapper.style.flexDirection = 'column'
        barWrapper.style.alignItems = 'center'
        barWrapper.style.height = '100%'
        barWrapper.style.justifyContent = 'flex-end'
        barsContainer.appendChild(barWrapper)

        const barContainer = document.createElement('div')
        barContainer.style.width = '100%'
        barContainer.style.display = 'flex'
        barContainer.style.flexDirection = 'column'
        barContainer.style.alignItems = 'center'
        barContainer.style.justifyContent = 'flex-end'
        barContainer.style.flex = '1'
        barWrapper.appendChild(barContainer)

        const bar = document.createElement('div')
        const height =
          item.duration > 0 ? (item.duration / maxDuration) * 100 : 0
        bar.style.width = '100%'
        bar.style.height = `${height}%`
        bar.style.backgroundColor = '#28a745'
        bar.style.borderRadius = '4px 4px 0 0'
        bar.style.minHeight = item.duration > 0 ? '4px' : '0'
        bar.style.position = 'relative'
        barContainer.appendChild(bar)

        const timeLabel = document.createElement('div')
        timeLabel.innerText = formatDuration(item.duration)
        timeLabel.style.fontSize = '0.9rem'
        timeLabel.style.fontWeight = 'bold'
        timeLabel.style.marginBottom = '4px'
        timeLabel.style.color = '#fff'
        timeLabel.style.visibility = item.duration === 0 ? 'hidden' : 'visible'
        barContainer.insertBefore(timeLabel, bar)

        const dayLabel = document.createElement('div')
        dayLabel.innerText = item.label
        dayLabel.style.fontSize = '0.85rem'
        dayLabel.style.marginTop = '8px'
        dayLabel.style.textAlign = 'center'
        barWrapper.appendChild(dayLabel)
      })
    }

    // Add button click handlers
    weekBtn.addEventListener('click', () => renderChart('week'))
    monthBtn.addEventListener('click', () => renderChart('month'))
    yearBtn.addEventListener('click', () => renderChart('year'))

    // Initial render
    renderChart('week')
  }

  // coke bottle visualization
  async function createCokeBottleVisualization(row) {
    const scenes = await getScenesWithOHistory()

    // Count total O's from scenes with o_history (videos only)
    let totalOs = 0
    scenes.forEach((scene) => {
      if (scene.o_history && scene.o_history.length > 0) {
        totalOs += scene.o_history.length
      }
    })

    const ouncesPerO = 0.1
    const ouncesPerBottle = 12
    const totalOunces = totalOs * ouncesPerO
    const fullBottles = Math.floor(totalOunces / ouncesPerBottle)
    const remainingOunces = totalOunces % ouncesPerBottle
    const partialBottleFill = remainingOunces / ouncesPerBottle

    // Create container
    const bottleContainer = document.createElement('div')
    bottleContainer.style.width = '100%'
    bottleContainer.style.padding = '1rem'
    bottleContainer.style.textAlign = 'center'
    row.appendChild(bottleContainer)

    const bottleTitle = document.createElement('h4')
    bottleTitle.innerText = `FILLED: ${(totalOunces / ouncesPerBottle).toFixed(
      1
    )} BOTTLES (${totalOunces.toFixed(1)} oz)`
    bottleTitle.style.marginBottom = '1rem'
    bottleTitle.style.fontSize = '1.2rem'
    bottleContainer.appendChild(bottleTitle)

    const bottlesWrapper = document.createElement('div')
    bottlesWrapper.style.display = 'flex'
    bottlesWrapper.style.justifyContent = 'center'
    bottlesWrapper.style.alignItems = 'flex-end'
    bottlesWrapper.style.gap = '10px'
    bottlesWrapper.style.flexWrap = 'wrap'
    bottleContainer.appendChild(bottlesWrapper)

    const bottleHeight = 150 // pixels (half of 300px image)
    const bottleWidth = 60 // pixels (half of original width)

    // Create full bottles
    for (let i = 0; i < fullBottles; i++) {
      const bottleWrapper = document.createElement('div')
      bottleWrapper.style.width = `${bottleWidth}px`
      bottleWrapper.style.height = `${bottleHeight}px`
      bottleWrapper.style.position = 'relative'
      bottleWrapper.style.overflow = 'hidden'
      bottlesWrapper.appendChild(bottleWrapper)

      const bottleImg = document.createElement('img')
      bottleImg.src = 'https://i.imgur.com/mhB3zK6.png'
      bottleImg.style.width = 'auto'
      bottleImg.style.height = '100%'
      bottleImg.style.display = 'block'
      bottleImg.style.position = 'absolute'
      bottleImg.style.bottom = '0'
      bottleImg.style.left = '50%'
      bottleImg.style.transform = 'translateX(-50%)'
      bottleWrapper.appendChild(bottleImg)
    }

    // Create partial bottle if there's remaining ounces
    if (partialBottleFill > 0) {
      const bottleWrapper = document.createElement('div')
      bottleWrapper.style.width = `${bottleWidth}px`
      bottleWrapper.style.height = `${bottleHeight}px`
      bottleWrapper.style.position = 'relative'
      bottleWrapper.style.overflow = 'hidden'
      bottlesWrapper.appendChild(bottleWrapper)

      const clipHeight = bottleHeight * partialBottleFill
      const clipWrapper = document.createElement('div')
      clipWrapper.style.width = '100%'
      clipWrapper.style.height = `${clipHeight}px`
      clipWrapper.style.position = 'absolute'
      clipWrapper.style.bottom = '0'
      clipWrapper.style.overflow = 'hidden'
      bottleWrapper.appendChild(clipWrapper)

      const bottleImg = document.createElement('img')
      bottleImg.src = 'https://i.imgur.com/mhB3zK6.png'
      bottleImg.style.width = 'auto'
      bottleImg.style.height = `${bottleHeight}px`
      bottleImg.style.display = 'block'
      bottleImg.style.position = 'absolute'
      bottleImg.style.bottom = '0'
      bottleImg.style.left = '50%'
      bottleImg.style.transform = 'translateX(-50%)'
      clipWrapper.appendChild(bottleImg)
    }
  }

  csLib.PathElementListener(
    '/stats',
    'div.container-fluid div.mt-5',
    setupStats
  )
  async function setupStats(el) {
    if (document.querySelector('.custom-stats-row')) return
    const changelog = el.querySelector('div.changelog')

    // Create header for O stats
    const oStatsHeader = document.createElement('h3')
    oStatsHeader.style.marginTop = '2rem'
    oStatsHeader.style.marginBottom = '2rem'
    oStatsHeader.style.textAlign = 'center'
    oStatsHeader.style.fontSize = '3rem'
    oStatsHeader.innerText = 'O Stats (Video)'
    el.insertBefore(oStatsHeader, changelog)

    const rowOne = document.createElement('div')
    rowOne.classList = 'custom-stats-row col col-sm-8 m-sm-auto row stats'
    rowOne.style.justifyContent = 'center'
    el.insertBefore(rowOne, changelog)
    const rowTwo = document.createElement('div')
    rowTwo.classList = 'custom-stats-row col col-sm-8 m-sm-auto row stats'
    rowTwo.style.justifyContent = 'center'
    rowTwo.style.paddingTop = '2rem'
    el.insertBefore(rowTwo, changelog)
    const rowThree = document.createElement('div')
    rowThree.classList = 'custom-stats-row col col-sm-8 m-sm-auto row stats'
    rowThree.style.justifyContent = 'center'
    rowThree.style.paddingTop = '4rem'
    el.insertBefore(rowThree, changelog)
    const rowFour = document.createElement('div')
    rowFour.classList = 'custom-stats-row col col-sm-8 m-sm-auto row stats'
    rowFour.style.justifyContent = 'center'
    rowFour.style.paddingTop = '4rem'
    rowFour.style.paddingBottom = '6rem'
    el.insertBefore(rowFour, changelog)
    const rowFive = document.createElement('div')
    rowFive.classList = 'custom-stats-row col col-sm-8 m-sm-auto row stats'
    rowFive.style.justifyContent = 'center'
    rowFive.style.paddingTop = '4rem'
    rowFive.style.paddingBottom = '12rem'
    el.insertBefore(rowFive, changelog)

    await createOrgasmsToday(rowOne)
    await createBestOrgasmDay(rowOne)
    await createOrgasmStreak(rowOne)
    await createLongestWatchedDay(rowOne)
    await createMostOScene(rowTwo)
    await createLongestWatchedScene(rowTwo)
    await createMostOImage(rowTwo)
    await createMostRecentOScene(rowTwo)
    await createOldestOScene(rowTwo)
    await createWeeklyBarChart(rowThree)
    await createWeeklyWatchTimeChart(rowFour)
    // await createCokeBottleVisualization(rowFive)
  }
})()
