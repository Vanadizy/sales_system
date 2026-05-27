import { Component } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default class AppErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  resetData = () => {
    localStorage.removeItem('axispos.prototype.v1')
    localStorage.removeItem('axispos.session.v1')
    window.location.assign('/login')
  }

  render() {
    if (!this.state.failed) return this.props.children
    return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5"><section className="card max-w-md text-center"><AlertTriangle className="mx-auto mb-4 text-amber-500" size={38} /><h1 className="text-xl font-bold">Unable to display this page</h1><p className="mt-2 text-sm text-slate-500">Saved data is not compatible with this view. Reset local sample data to continue safely.</p><button className="btn-primary mt-6" onClick={this.resetData}><RotateCcw size={17} />Reset sample data</button></section></main>
  }
}
