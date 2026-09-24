import { Component, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { gsap } from 'gsap'
import './styles.css'

const works = [
  { title: '爆款开头', type: '内容增长', note: '前三秒的注意力设计', video: '/videos/01-hook-strategy.mp4', index: '01' },
  { title: '拍摄手法', type: '视觉生产', note: '让表达具备记忆点', video: '/videos/02-shooting-language.mp4', index: '02' },
  { title: '个人 IP 运营', type: '人物案例', note: '编导与运营的协同', video: '/videos/03-personal-ip.mp4', index: '03' },
  { title: '10S 香水电商', type: 'AI 广告', note: '快速完成商品氛围叙事', video: '/videos/04-ai-perfume-ad.mp4', index: '04' },
  { title: '二手浪漫', type: 'AI 创意', note: '短叙事的情绪切片', video: '/videos/05-ai-standup.mp4', index: '05' },
  { title: 'AI Motion', type: 'AI 创意', note: '动态视觉实验', video: '/videos/06-ai-motion.mp4', index: '06' },
]

const advantages = [
  ['01', '定位先行', '先找到账号的增长命题，再决定每一条内容该说什么。'],
  ['02', '内容成片', '从选题、脚本到拍摄语言，让表达真正适合短视频环境。'],
  ['03', 'AI 增效', '用 AI 加速创意验证与视觉生产，把时间留给策略判断。'],
  ['04', '持续运营', '不只交付单条内容，而是建立可持续的内容迭代节奏。'],
]

const capabilitySummary = [
  ['内容策划', '定位、赛道、选题、脚本与分镜，用视觉冲击和反差感建立记忆点。'],
  ['拍摄剪辑', '独立完成口播、吃播、产品展示等短视频的拍摄与剪辑。'],
  ['账号运营', '从 0 起号到稳定涨粉，统筹发布节奏、评论区运营与数据复盘。'],
  ['商业变现', '围绕 IP 与产品设计选品、招商加盟素材和私域成交链路。'],
  ['数据复盘', '追踪播放、完播、涨粉、客资与成交，推动下一轮内容迭代。'],
]

const collaborators = [
  { index: '01', name: '老杨｜博取教育', handle: '商家认证号', direction: '教育类', service: '接管账号', likes: '180.8 万获赞', followers: '27.1 万粉丝' },
  { index: '02', name: '周大签', handle: '抖音号：DQHGDL', direction: '餐饮类', service: '起号', likes: '2298.3 万获赞', followers: '120.5 万粉丝' },
  { index: '03', name: '大卫的家 🏠（装修中）', handle: '抖音号：73932744077', direction: '装修类', service: '重新策划拍摄内容与账号方向', likes: '331.9 万获赞', followers: '48.7 万粉丝' },
]

class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Portfolio rendering error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <main className="error-boundary"><p>页面加载出现问题，请刷新后重试。</p></main>
    }
    return this.props.children
  }
}

function ParticleCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!canvas || reduceMotion || window.innerWidth < 768) return undefined

    const context = canvas.getContext('2d')
    const particles = []
    const count = 72
    let frameId
    let paused = document.hidden
    let width = 0
    let height = 0
    let dpr = 1
    let resizeFrame

    const seed = () => {
      particles.length = 0
      for (let index = 0; index < count; index += 1) {
        particles.push({ x: Math.random() * width, y: Math.random() * height, size: Math.random() * 1.35 + .3, speed: Math.random() * .22 + .05, drift: (Math.random() - .5) * .18, alpha: Math.random() * .45 + .2 })
      }
    }

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed()
    }

    const queueResize = () => {
      window.cancelAnimationFrame(resizeFrame)
      resizeFrame = window.requestAnimationFrame(resize)
    }

    const render = () => {
      if (paused) return
      context.clearRect(0, 0, width, height)
      particles.forEach((particle) => {
        particle.y -= particle.speed
        particle.x += particle.drift
        if (particle.y < -8) particle.y = height + 8
        if (particle.x < -8) particle.x = width + 8
        if (particle.x > width + 8) particle.x = -8
        context.beginPath()
        context.fillStyle = `rgba(203, 146, 255, ${particle.alpha})`
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        context.fill()
      })
      frameId = window.requestAnimationFrame(render)
    }

    const onVisibilityChange = () => {
      paused = document.hidden
      if (!paused) frameId = window.requestAnimationFrame(render)
    }

    resize()
    render()
    window.addEventListener('resize', queueResize, { passive: true })
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.cancelAnimationFrame(resizeFrame)
      window.removeEventListener('resize', queueResize)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return <canvas className="particle-canvas" ref={canvasRef} aria-hidden="true" />
}

function DeferredLoopVideo({ className, source }) {
  const videoRef = useRef(null)
  const visibleRef = useRef(false)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !('IntersectionObserver' in window)) {
      setShouldLoad(true)
      return undefined
    }

    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting
      if (entry.isIntersecting) {
        setShouldLoad(true)
        if (video.readyState >= 2) video.play()
      } else {
        video.pause()
      }
    }, { rootMargin: '240px 0px' })

    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  return <video ref={videoRef} className={className} muted loop playsInline preload={shouldLoad ? 'metadata' : 'none'} onCanPlay={() => visibleRef.current && videoRef.current?.play()}>{shouldLoad && <source src={source} type="video/mp4" />}</video>
}

function VideoCard({ work }) {
  const cardRef = useRef(null)
  const videoRef = useRef(null)
  const isHoveringRef = useRef(false)
  const moveXRef = useRef(null)
  const moveYRef = useRef(null)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const card = cardRef.current
    if (!card || !('IntersectionObserver' in window)) {
      setShouldLoad(true)
      return undefined
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setShouldLoad(true)
      observer.disconnect()
    }, { rootMargin: '420px 0px' })

    observer.observe(card)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!videoRef.current) return undefined
    moveXRef.current = gsap.quickTo(videoRef.current, 'x', { duration: .9, ease: 'power3.out' })
    moveYRef.current = gsap.quickTo(videoRef.current, 'y', { duration: .9, ease: 'power3.out' })
    return () => {
      moveXRef.current = null
      moveYRef.current = null
    }
  }, [])

  const handleMouseMove = (event) => {
    if (window.innerWidth < 768) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - .5
    const y = (event.clientY - bounds.top) / bounds.height - .5
    moveXRef.current?.(x * 11)
    moveYRef.current?.(y * 9)
  }

  const handleMouseLeave = () => {
    isHoveringRef.current = false
    videoRef.current?.pause()
    if (videoRef.current) videoRef.current.currentTime = 0
    moveXRef.current?.(0)
    moveYRef.current?.(0)
  }

  const handleMouseEnter = () => {
    isHoveringRef.current = true
    setShouldLoad(true)
    if (videoRef.current?.readyState >= 2) videoRef.current.play()
  }

  return (
    <article className="work-card" ref={cardRef} onMouseEnter={handleMouseEnter} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <video ref={videoRef} className="work-video" muted loop playsInline preload={shouldLoad ? 'metadata' : 'none'} onCanPlay={() => isHoveringRef.current && videoRef.current?.play()}>
        {shouldLoad && <source src={work.video} type="video/mp4" />}
      </video>
      <div className="work-shade" />
      <div className="work-number">{work.index}</div>
      <div className="work-copy">
        <span>{work.type}</span>
        <h3>{work.title}</h3>
        <p>{work.note}</p>
      </div>
      <div className="work-play" aria-label={`播放 ${work.title}`}>▶</div>
    </article>
  )
}

async function createScrollAnimations(root) {
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
gsap.registerPlugin(ScrollTrigger)
  ScrollTrigger.config({ limitCallbacks: true })

  return gsap.context(() => {
    const select = gsap.utils.selector(root)
    const one = (selector) => select(selector)[0]
    const revealSection = ({ trigger, label, title, content = [], cards = [], visual }) => {
      const timeline = gsap.timeline({ scrollTrigger: { trigger, start: 'top 73%', once: true } })
      if (label) timeline.fromTo(label, { autoAlpha: 0, x: -34, clipPath: 'inset(0 100% 0 0)' }, { autoAlpha: 1, x: 0, clipPath: 'inset(0 0% 0 0)', duration: .7, ease: 'power3.out' })
      if (title) timeline.fromTo(title, { autoAlpha: 0, y: 126, scale: 1.05, clipPath: 'inset(0 0 100% 0)', letterSpacing: '.025em', transformOrigin: '0% 100%' }, { autoAlpha: 1, y: 0, scale: 1, clipPath: 'inset(0 0 0% 0)', letterSpacing: '-.07em', duration: 1.12, ease: 'expo.out' }, '-=.28')
      if (visual) timeline.fromTo(visual, { autoAlpha: 0, clipPath: 'inset(0 100% 0 0)', scale: 1.06 }, { autoAlpha: 1, clipPath: 'inset(0 0% 0 0)', scale: 1, duration: 1.18, ease: 'power3.out' }, '-=.78')
      if (content.length) timeline.fromTo(content, { autoAlpha: 0, y: 46 }, { autoAlpha: 1, y: 0, duration: .78, stagger: .1, ease: 'power3.out' }, '-=.68')
      if (cards.length) {
        gsap.set(cards, { transformPerspective: 900, transformOrigin: '50% 100%' })
        timeline.fromTo(cards, { autoAlpha: 0, y: 72, rotateX: 6, clipPath: 'inset(0 100% 0 0)' }, { autoAlpha: 1, y: 0, rotateX: 0, clipPath: 'inset(0 0% 0 0)', duration: 1, stagger: .13, ease: 'power3.out' }, '-=.42')
      }
    }

    revealSection({
      trigger: one('.about'), label: select('.about > .section-label'), title: select('.about-copy h2'), visual: select('.about-visual'),
      content: select('.about-copy .eyebrow, .about-copy .body-copy, .capability-item'),
    })
    revealSection({
      trigger: one('.works'), label: select('.works .section-label'), title: select('.works .section-head h2'), content: select('.works .section-head p'), cards: select('.work-card'),
    })
    revealSection({
      trigger: one('.strength'), label: select('.strength > .section-label'), title: select('.strength-intro h2'), content: select('.strength-intro p'), cards: select('.advantage'),
    })
    revealSection({
      trigger: one('.collaborators'), label: select('.collaborators > .section-label'), title: select('.collaborators-intro h2'), content: select('.collaborators-intro p'), cards: select('.creator-card'),
    })
    revealSection({
      trigger: one('.contact'), label: select('.contact .eyebrow'), title: select('.contact h2'), content: select('.contact-inner > p:not(.eyebrow), .contact .button, .contact-note'),
    })

    gsap.to(select('.hero-art img'), { yPercent: -4, ease: 'none', scrollTrigger: { trigger: one('.hero'), start: 'top top', end: 'bottom top', scrub: .8 } })
    select('.about-video, .work-video').forEach((visual) => {
      const container = visual.closest('.about-visual, .work-card')
      gsap.fromTo(visual, { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: container, start: 'top bottom', end: 'bottom top', scrub: 1.1 } })
    })
  }, root)
}

function App() {
  const appRef = useRef(null)

  useLayoutEffect(() => {
    const root = appRef.current
    const nav = root?.querySelector('.nav')
    const navLinks = Array.from(root?.querySelectorAll('.nav-links a[href^="#"]') ?? [])
    const sections = navLinks.map((link) => root?.querySelector(link.getAttribute('href'))).filter(Boolean)
    const setActiveNavLink = (id) => navLinks.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`))
    const sectionObserver = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver((entries) => {
      const activeEntry = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
      if (activeEntry) setActiveNavLink(activeEntry.target.id)
    }, { rootMargin: '-28% 0px -62% 0px', threshold: .01 })
    sections.forEach((section) => sectionObserver?.observe(section))
    let scrollFrame
    const updateNavigation = () => nav?.classList.toggle('is-scrolled', window.scrollY > window.innerHeight * .72)
    const queueNavigationUpdate = () => {
      if (scrollFrame) return
      scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = undefined
        updateNavigation()
      })
    }
    const handleVisibility = () => {
      const ambientVideos = root?.querySelectorAll('.hero-video, .about-video') ?? []
      if (document.hidden) {
        gsap.globalTimeline.pause()
        ambientVideos.forEach((video) => video.pause())
      } else {
        gsap.globalTimeline.resume()
        ambientVideos.forEach((video) => {
          const bounds = video.getBoundingClientRect()
          if (bounds.top < window.innerHeight && bounds.bottom > 0) video.play().catch(() => {})
        })
      }
    }

    updateNavigation()
    if (document.hidden) gsap.globalTimeline.pause()
    window.addEventListener('scroll', queueNavigationUpdate, { passive: true })
    document.addEventListener('visibilitychange', handleVisibility)

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!root || reduceMotion || window.innerWidth < 768) {
      return () => {
        window.cancelAnimationFrame(scrollFrame)
        window.removeEventListener('scroll', queueNavigationUpdate)
        document.removeEventListener('visibilitychange', handleVisibility)
        sectionObserver?.disconnect()
      }
    }

    const context = gsap.context(() => {
      const select = gsap.utils.selector(root)
      const titleLines = select('.hero-copy h1 > span, .hero-copy h1 > em')
      const heroVideo = select('.hero-video')
      const heroArt = select('.hero-art')
      const heroCopy = select('.hero-copy')
      const heroSubtitle = select('.hero-description, .hero-copy .eyebrow')
      const heroActions = select('.hero-actions')
      const heroStats = select('.hero-stats')
      const scrollCue = select('.scroll-cue')

      gsap.set(heroVideo, { autoAlpha: 0, scale: 1.08 })
      gsap.set(heroArt, { autoAlpha: 0, y: 64, scale: .94 })
      gsap.set(heroCopy, { autoAlpha: 1 })
      gsap.set(titleLines, { autoAlpha: 0, y: 80, scale: 1.1, clipPath: 'inset(0 0 100% 0)', letterSpacing: '.025em', transformOrigin: '0% 100%' })
      gsap.set(heroSubtitle, { autoAlpha: 0, y: 34 })
      gsap.set([heroActions, heroStats], { autoAlpha: 0, x: -60 })
      gsap.set(scrollCue, { autoAlpha: 0, x: 60 })
      gsap.set(nav, { autoAlpha: 0, y: -52 })

      gsap.timeline()
        .to(heroVideo, { autoAlpha: .11, scale: 1, duration: 1, ease: 'power2.out' })
        .to(heroArt, { autoAlpha: 1, y: 0, scale: 1, duration: 1.45, ease: 'expo.out' }, .38)
        .to(titleLines, { autoAlpha: 1, y: 0, scale: 1, clipPath: 'inset(0 0 0% 0)', letterSpacing: '-.09em', duration: 1.34, stagger: .15, ease: 'expo.out' }, .46)
        .to(heroSubtitle, { autoAlpha: 1, y: 0, duration: .86, stagger: .1, ease: 'power3.out' }, 1.14)
        .to([heroActions, heroStats], { autoAlpha: 1, x: 0, duration: .95, stagger: .12, ease: 'power3.out' }, 1.54)
        .to(scrollCue, { autoAlpha: 1, x: 0, duration: .9, ease: 'power3.out' }, 1.68)
        .to(nav, { autoAlpha: 1, y: 0, duration: .74, ease: 'expo.out' }, 1.98)

    }, root)

    let disposed = false
    let scrollContext
    const loadScrollAnimations = () => {
      void createScrollAnimations(root).then((loadedContext) => {
        if (disposed) loadedContext.revert()
        else scrollContext = loadedContext
      })
    }
    const idleId = typeof window.requestIdleCallback === 'function'
      ? window.requestIdleCallback(loadScrollAnimations, { timeout: 1200 })
      : window.setTimeout(loadScrollAnimations, 520)

    return () => {
      disposed = true
      context.revert()
      scrollContext?.revert()
      if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idleId)
      else window.clearTimeout(idleId)
      window.cancelAnimationFrame(scrollFrame)
      window.removeEventListener('scroll', queueNavigationUpdate)
      document.removeEventListener('visibilitychange', handleVisibility)
      sectionObserver?.disconnect()
    }
  }, [])

  return (
    <main ref={appRef}>
      <section className="hero" id="home">
        <video className="hero-video" autoPlay muted loop playsInline preload="metadata">
          <source src="/videos/about-loop.mp4" type="video/mp4" />
        </video>
        <div className="hero-video-mask" />
        <div className="grain" />
        <ParticleCanvas />
        <nav className="nav shell">
          <a className="brand" href="#home" aria-label="首页"><b>DM</b><span>Digital<br />Operator</span></a>
          <div className="nav-links">
            <a href="#about">关于我</a><a href="#works">作品集</a><a href="#strength">能力</a><a href="#collaborators">合作达人</a>
          </div>
          <a className="nav-cta" href="#contact"><span>开启合作</span> <i>↗</i></a>
        </nav>

        <div className="hero-body shell">
          <div className="hero-copy" data-reveal>
            <p className="eyebrow"><span /> INDEPENDENT DIGITAL OPERATOR</p>
            <h1><span>DIGITAL</span><em>MARKETING</em><span>SOLUTIONS</span></h1>
            <p className="hero-description">将账号定位、内容生产与 AI 创意合成一套可持续的增长动作。为想要被看见的品牌，找到自己的内容引力场。</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#works"><span>查看精选作品</span> <b>↘</b></a>
              <a className="button button-ghost" href="#about"><i>▶</i><span>了解我的方法</span></a>
            </div>
          </div>
          <div className="hero-art" data-reveal>
            <img src="/images/portrait.png" alt="个人形象照" width="765" height="1041" fetchPriority="high" decoding="async" />
            <div className="orbit orbit-one" /><div className="orbit orbit-two" />
            <div className="signal-card card-one"><span>FOCUS</span><strong>CONTENT<br />GRAVITY</strong></div>
            <div className="signal-card card-two"><span>MODE</span><strong>GROWTH<br />SYSTEM</strong></div>
          </div>
        </div>
        <div className="hero-stats shell" data-reveal>
          <div><b>35</b><span>已归档作品</span></div><div><b>08</b><span>内容方向</span></div><div><b>内容 × AI</b><span>双线创作能力</span></div><div><b>01</b><span>独立代运营</span></div>
        </div>
        <a className="scroll-cue" href="#about"><span>SCROLL TO EXPLORE</span><i>↓</i></a>
      </section>

      <section className="about section shell" id="about">
        <div className="section-label" data-reveal><span>01</span> ABOUT ME</div>
        <div className="about-grid">
          <div className="about-visual" data-reveal>
            <DeferredLoopVideo className="about-video" source="/videos/about-loop.mp4" />
          </div>
          <div className="about-copy" data-reveal>
            <p className="eyebrow">SKILL SET / CONTENT SYSTEM BUILDER</p>
            <h2>从内容到成交，<br /><em>做全链路增长。</em></h2>
            <p className="body-copy">围绕账号增长，把策略、创作、运营与转化串成一套可持续复盘的行动闭环。</p>
            <div className="capability-list">{capabilitySummary.map(([title, text]) => <div className="capability-item" key={title}><b>{title}</b><span>{text}</span></div>)}</div>
          </div>
        </div>
      </section>

      <section className="works section" id="works">
        <div className="shell">
          <div className="section-head" data-reveal><div className="section-label"><span>02</span> SELECTED WORKS</div><h2 className="works-title"><span>把策略，</span><em>落到每一帧。</em></h2><p>鼠标悬停即可预览作品片段</p></div>
          <div className="works-grid">{works.map((work) => <VideoCard key={work.index} work={work} />)}</div>
        </div>
      </section>

      <section className="strength section shell" id="strength">
        <div className="section-label" data-reveal><span>03</span> MY CAPABILITIES</div>
        <div className="strength-intro" data-reveal><h2>从定位到交付，<br />把内容做成<em>增长。</em></h2><p>一套能够理解品牌、观察受众并持续调整的内容系统。</p></div>
        <div className="advantages">{advantages.map(([number, title, text]) => <article className="advantage" key={number} data-reveal><span>{number}</span><div className="advantage-icon">✦</div><h3>{title}</h3><p>{text}</p><i>↗</i></article>)}</div>
      </section>

      <section className="collaborators section shell" id="collaborators">
        <div className="section-label" data-reveal><span>04</span> CREATOR COLLABORATIONS</div>
        <div className="collaborators-intro" data-reveal><h2>合作达人，<br /><em>正在持续生长。</em></h2><p>覆盖教育、餐饮与装修赛道；从接管账号到起号与内容重策划，按账号阶段匹配运营动作。</p></div>
        <div className="creator-grid">
          {collaborators.map((creator) => <article className="creator-card" key={creator.index} data-reveal>
            <div className="creator-art"><span className="creator-kicker">{creator.direction}</span><b>{creator.index}</b><div className="creator-stats"><span>{creator.likes}</span><span>{creator.followers}</span></div></div>
            <div className="creator-info"><span>{creator.handle}</span><h3>{creator.name}</h3><p>合作内容 · {creator.service}</p></div>
          </article>)}
        </div>
      </section>

      <section className="contact" id="contact">
        <div className="contact-aura" />
        <div className="shell contact-inner" data-reveal>
          <p className="eyebrow"><span /> LET'S MAKE A SIGNAL</p>
          <h2>准备好让你的品牌<br /><em>被看见了吗？</em></h2>
          <p>把你的品牌、目标和难题告诉我，我们从下一条内容开始。</p>
          <a className="button button-primary button-large" href="/images/wechat-qr.jpg" target="_blank" rel="noreferrer"><span>发起合作咨询</span> <b>↗</b></a>
          <div className="contact-note">邮箱：18183413411@163.com / 微信：S1mpledzfzxf</div>
        </div>
        <footer className="shell"><a className="brand" href="#home"><b>DM</b><span>Digital<br />Operator</span></a><span>© 2026 · INDEPENDENT DIGITAL OPERATOR</span><a href="#home">BACK TO TOP ↑</a></footer>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<ErrorBoundary><App /></ErrorBoundary>)
